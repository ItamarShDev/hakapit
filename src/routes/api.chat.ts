import { chat } from "@tanstack/ai";
import { createGeminiChat } from "@tanstack/ai-gemini";
import { googleSearchTool } from "@tanstack/ai-gemini/tools";
import { createFileRoute } from "@tanstack/react-router";

import { createChatResponse } from "~/server/chat-stream";

const searchTool = googleSearchTool();

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) return Response.json({ error: "Chat is temporarily unavailable" }, { status: 503 });
        return createChatResponse(request, (messages, abortController) =>
          chat({
            adapter: createGeminiChat("gemini-3.5-flash-lite", apiKey),
            tools: [searchTool],
            systemPrompts: [
              `You are a Liverpool FC expert. Always use the search tool to find current information. Keep responses short and factual. Current year: ${new Date().getFullYear()}.`,
            ],
            messages,
            abortController,
          }),
        );
      },
    },
  },
});
