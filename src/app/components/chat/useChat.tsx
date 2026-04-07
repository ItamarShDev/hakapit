import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import { useState } from "react";
import { z } from "zod";

const chatInputSchema = z.object({
  query: z.string().min(1),
});

type ChatInput = z.infer<typeof chatInputSchema>;

export function useChatHook() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, isLoading, error } = useChat({
    connection: fetchServerSentEvents("/api/chat"),
  });

  const streamAnswer = async (query: string) => {
    const parsed: ChatInput = chatInputSchema.parse({ query });

    // Send message using TanStack AI
    sendMessage(parsed.query);
  };

  // Combine all message parts into a single answer string
  const answer = messages
    .filter((m) => m.role === "assistant")
    .flatMap((m) => m.parts)
    .filter((p) => p.type === "text")
    .map((p) => p.content)
    .join("");

  // Extract citations if any (from tool calls or metadata)
  const citations: { url: string }[] = [];

  return {
    answer,
    citations,
    isLoading,
    error: error?.message || null,
    streamAnswer,
    input,
    setInput,
    reset: () => {
      setInput("");
    },
  };
}
