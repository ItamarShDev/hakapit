import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const chatRequestSchema = z.object({
	messages: z
		.array(
			z.object({
				role: z.enum(["system", "user", "assistant", "tool"]),
				content: z.string().min(1),
			}),
		)
		.min(1),
});

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				console.log("[API Chat] Received request");
				console.log("[API Chat] GOOGLE_API_KEY exists:", !!process.env.GOOGLE_API_KEY);

				if (!process.env.GOOGLE_API_KEY) {
					console.error("[API Chat] GOOGLE_API_KEY not configured");
					return new Response(
						JSON.stringify({ error: "GOOGLE_API_KEY not configured" }),
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

					console.log("[API Chat] chat succeeded, returning stream");
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