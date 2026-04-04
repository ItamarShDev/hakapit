import { google } from "@ai-sdk/google";
import { createFileRoute } from "@tanstack/react-router";
import { streamText, type CoreMessage } from "ai";
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
				const parsed = chatRequestSchema.parse(await request.json());
				const messages = parsed.messages as CoreMessage[];

				const result = streamText({
					model: google("gemini-2.5-flash"),
					messages,
					system: `You are a Liverpool FC expert. always search the web to find the answer. do not provide any additional information. keep it short and sweet. unless said otherwise the year asked about is ${new Date().getFullYear()}. Verify the information you provide is correct.`,
				});

				return result.toDataStreamResponse();
			},
		},
	},
});