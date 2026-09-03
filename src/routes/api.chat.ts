import { chat } from "@tanstack/ai";
import { createGeminiChat } from "@tanstack/ai-gemini";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// This format is required for Gemini's native Google Search integration
const searchTool = {
  name: "google_search",
  description: "Search Google for current information",
  metadata: {},
};

const chatRequestSchema = z.object({
  messages: z
    .array(
      z
        .object({
          role: z.enum(["system", "user", "assistant", "tool"]),
          parts: z
            .array(
              z.union([
                z.object({
                  type: z.literal("text"),
                  content: z.string(),
                }),
                z
                  .object({
                    type: z.string(),
                  })
                  .passthrough(),
              ]),
            )
            .optional()
            .default([]),
          content: z.string().optional(),
        })
        .transform((msg) => {
          if (msg.parts && msg.parts.length > 0) {
            const textParts = msg.parts
              .filter((p) => p.type === "text" && (p as any).content)
              .map((p) => (p as any).content)
              .join("");
            if (textParts) {
              return { role: msg.role, content: textParts };
            }
          }
          if (msg.content) {
            return { role: msg.role, content: msg.content };
          }
          return { role: msg.role, content: "" };
        }),
    )
    .min(1),
});

type Message = { role: string; content: string };
function getMinimalHistory(messages: Message[]) {
  let lastAssistantIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant" && messages[i].content.length > 0) {
      lastAssistantIndex = i;
      break;
    }
  }

  return messages.filter((m, index) => {
    if (m.role === "user" && m.content.length > 0) return true;
    if (m.role === "assistant" && m.content.length > 0) {
      return index === lastAssistantIndex;
    }
    return false;
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
          return new Response(JSON.stringify({ error: "GOOGLE_GENERATIVE_AI_API_KEY not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const body = await request.json();
        const parsed = chatRequestSchema.parse(body);

        const validMessages = parsed.messages.filter((m) => m.content.length > 0);

        const minimalMessages = getMinimalHistory(validMessages);

        let lastError: Error | null = null;
        const maxAttempts = 2;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const stream = chat({
              adapter: createGeminiChat("gemini-2.5-flash", process.env.GOOGLE_GENERATIVE_AI_API_KEY!),
              tools: [searchTool],
              systemPrompts: [
                `You are a Liverpool FC expert. Always use the search tool to find current information. Keep responses short and factual. Current year: ${new Date().getFullYear()}.`,
              ],
              messages: minimalMessages as any,
            });

            const chunks: any[] = [];
            for await (const chunk of stream) {
              if (chunk.type === "RUN_ERROR") {
                const errorCode = String(chunk.error?.code || "");
                const isRateLimit = errorCode === "429" || String(chunk.error?.message || "").includes("429");

                if (isRateLimit) {
                  console.error("[API Chat] Rate limit exceeded");
                  const errorStream = new ReadableStream({
                    start(controller) {
                      const encoder = new TextEncoder();
                      const errorChunk = {
                        type: "RUN_ERROR",
                        timestamp: Date.now(),
                        error: {
                          message: "שירות הצ'אט זמני לא זמין בשל עומס. אנא נסה שוב בעוד מספר דקות.",
                          code: 429,
                        },
                      };
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`));
                      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                      controller.close();
                    },
                  });
                  return new Response(errorStream, {
                    headers: {
                      "Content-Type": "text/event-stream",
                      "Cache-Control": "no-cache",
                      Connection: "keep-alive",
                    },
                  });
                }
              }

              chunks.push(chunk);
              if (chunks.length > 100) break;
            }

            console.log("[API Chat] Total chunks received:", chunks.length);

            const readableStream = new ReadableStream({
              start(controller) {
                const encoder = new TextEncoder();
                for (const chunk of chunks) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
                }
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
              },
            });

            return new Response(readableStream, {
              headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
              },
            });
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.error(`[API Chat] Attempt ${attempt} failed:`, lastError.message);

            if (attempt === maxAttempts) {
              break;
            }

            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        return new Response(
          JSON.stringify({
            error: lastError?.message || "Chat failed after retry",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
