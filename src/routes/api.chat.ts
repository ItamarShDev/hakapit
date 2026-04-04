import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
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
				if (!process.env.OPENAI_API_KEY) {
					return new Response(
						JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}

				const parsed = chatRequestSchema.parse(await request.json());

				try {
					const stream = chat({
						adapter: openaiText("gpt-4o-mini"),
						messages: [
							{ role: "system", content: `You are a Liverpool FC expert. always search the web to find the answer. do not provide any additional information. keep it short and sweet. unless said otherwise the year asked about is ${new Date().getFullYear()}. Verify the information you provide is correct.` },
							...parsed.messages,
						] as any,
					});

					return toServerSentEventsResponse(stream);
				} catch (error) {
					return new Response(
						JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}
			},
		},
	},
});