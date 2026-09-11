import { GoogleGenAI } from "@google/genai";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat-debug")({
  server: {
    handlers: {
      GET: async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });
        const r = await ai.models.generateContentStream({
          model: "gemini-2.5-flash",
          contents: "Who is the Liverpool FC manager? Answer in one short sentence.",
          config: {
            systemInstruction: `You are a Liverpool FC expert. Always use the search tool to find current information. Keep responses short and factual. Current year: ${new Date().getFullYear()}.`,
            tools: [{ googleSearch: {} }],
          },
        });
        const out: unknown[] = [];
        for await (const c of r) out.push(c);
        return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
