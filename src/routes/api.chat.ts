import { chat } from "@tanstack/ai";
import { createGeminiChat } from "@tanstack/ai-gemini";
import { createFileRoute } from "@tanstack/react-router";

import { chatRequestSchema, getMinimalHistory } from "~/features/chat/chat-request";

import type { StreamChunk } from "@tanstack/ai";

// Shape required by Gemini's native Google Search grounding
const searchTool = {
  name: "google_search",
  description: "Search Google for current information",
  metadata: {},
};

const MAX_ATTEMPTS = 2;
const MAX_CHUNKS = 100;
const RATE_LIMIT_MESSAGE = "שירות הצ'אט זמני לא זמין בשל עומס. אנא נסה שוב בעוד מספר דקות.";

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sseResponse(chunks: unknown[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function isRateLimit(chunk: StreamChunk) {
  if (chunk.type !== "RUN_ERROR") return false;
  return String(chunk.error?.code ?? "") === "429" || String(chunk.error?.message ?? "").includes("429");
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) return jsonError("GOOGLE_GENERATIVE_AI_API_KEY not configured");

        const parsed = chatRequestSchema.parse(await request.json());
        const messages = getMinimalHistory(parsed.messages);

        let lastError: Error | null = null;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          try {
            const stream = chat({
              adapter: createGeminiChat("gemini-2.5-flash", apiKey),
              tools: [searchTool],
              systemPrompts: [
                `You are a Liverpool FC expert. Always use the search tool to find current information. Keep responses short and factual. Current year: ${new Date().getFullYear()}.`,
              ],
              messages,
            });

            const chunks: StreamChunk[] = [];
            for await (const chunk of stream) {
              if (isRateLimit(chunk)) {
                console.error("[API Chat] Rate limit exceeded");
                return sseResponse([
                  { type: "RUN_ERROR", timestamp: Date.now(), error: { message: RATE_LIMIT_MESSAGE, code: 429 } },
                ]);
              }
              chunks.push(chunk);
              if (chunks.length > MAX_CHUNKS) break;
            }

            return sseResponse(chunks);
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.error(`[API Chat] Attempt ${attempt} failed:`, lastError.message);
            if (attempt < MAX_ATTEMPTS) await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        return jsonError(lastError?.message || "Chat failed after retry");
      },
    },
  },
});
