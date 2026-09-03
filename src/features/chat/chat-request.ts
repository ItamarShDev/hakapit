import { z } from "zod";

const partSchema = z.union([
  z.object({ type: z.literal("text"), content: z.string() }),
  z.object({ type: z.string() }).passthrough(),
]);

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z
        .object({
          role: z.enum(["user", "assistant", "tool"]),
          parts: z.array(partSchema).optional().default([]),
          content: z.string().optional(),
        })
        .transform((msg) => {
          const text = msg.parts
            .filter((p): p is { type: "text"; content: string } => p.type === "text" && "content" in p)
            .map((p) => p.content)
            .join("");
          return { role: msg.role, content: text || msg.content || "" };
        }),
    )
    .min(1),
});

export type ChatMessage = z.infer<typeof chatRequestSchema>["messages"][number];

/** Keeps every user turn but only the latest assistant reply, to stay within the model's context budget. */
export function getMinimalHistory(messages: ChatMessage[]): ChatMessage[] {
  const nonEmpty = messages.filter((m) => m.content.length > 0);
  const lastAssistantIndex = nonEmpty.map((m) => m.role).lastIndexOf("assistant");
  return nonEmpty.filter((m, index) => m.role === "user" || (m.role === "assistant" && index === lastAssistantIndex));
}
