import { google } from "@ai-sdk/google";
import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
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
				if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
					return new Response(
						JSON.stringify({ error: "GOOGLE_GENERATIVE_AI_API_KEY not configured" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}

				const parsed = chatRequestSchema.parse(await request.json());

				try {
					const result = streamText({
						model: google("gemini-2.0-flash-exp"),
						messages: parsed.messages as any,
						system: `You are a Liverpool FC expert. always search the web to find the answer. do not provide any additional information. keep it short and sweet. unless said otherwise the year asked about is ${new Date().getFullYear()}. Verify the information you provide is correct.`,
					});

					return result.toDataStreamResponse();
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