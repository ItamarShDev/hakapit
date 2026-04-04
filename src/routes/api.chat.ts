import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// TanStack AI message format with parts
const chatRequestSchema = z.object({
	messages: z
		.array(
			z.object({
				role: z.enum(["system", "user", "assistant", "tool"]),
				parts: z.array(
					z.object({
						type: z.literal("text"),
						content: z.string(),
					})
				).optional(),
				content: z.string().optional(),
			})
			.transform((msg) => {
				// Extract content from parts if available
				if (msg.parts && msg.parts.length > 0) {
					const textParts = msg.parts
						.filter((p) => p.type === "text")
						.map((p) => p.content)
						.join("");
					if (textParts) {
						return { role: msg.role, content: textParts };
					}
				}
				// Fallback to direct content
				if (msg.content) {
					return { role: msg.role, content: msg.content };
				}
				throw new Error("Message has neither parts nor content");
			})
			.refine((msg): msg is { role: "system" | "user" | "assistant" | "tool"; content: string } => {
				return msg.content.length > 0;
			}, {
				message: "Message content cannot be empty",
			}),
		)
		.min(1),
});

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				console.log("[API Chat] Received request");
				console.log("[API Chat] GOOGLE_GENERATIVE_AI_API_KEY exists:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

				if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
					console.error("[API Chat] GOOGLE_GENERATIVE_AI_API_KEY not configured");
					return new Response(
						JSON.stringify({ error: "GOOGLE_GENERATIVE_AI_API_KEY not configured" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}

				console.log("[API Chat] Parsing request body");
				const parsed = chatRequestSchema.parse(await request.json());
				console.log("[API Chat] Parsed messages:", JSON.stringify(parsed.messages));

				try {
					console.log("[API Chat] Calling chat with Gemini adapter");
					const stream = chat({
						adapter: geminiText("gemini-2.5-flash"),
						messages: [
							{ role: "system", content: `You are a Liverpool FC expert. always search the web to find the answer. do not provide any additional information. keep it short and sweet. unless said otherwise the year asked about is ${new Date().getFullYear()}. Verify the information you provide is correct.` },
							...parsed.messages,
						] as any,
					});

					console.log("[API Chat] chat succeeded, returning SSE stream");
					return toServerSentEventsResponse(stream);
				} catch (error) {
					console.error("[API Chat] Error during chat:", error);
					return new Response(
						JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}
			},
		},
	},
});