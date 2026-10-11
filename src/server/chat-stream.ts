import { EventType, toServerSentEventsResponse } from "@tanstack/ai";

import { chatRequestSchema, getMinimalHistory } from "~/features/chat/chat-request";

import type { StreamChunk } from "@tanstack/ai";
import type { ChatMessage } from "~/features/chat/chat-request";

type ChatStreamFactory = (messages: ChatMessage[], abortController: AbortController) => AsyncIterable<StreamChunk>;

const UNAVAILABLE_MESSAGE = "שירות הצ'אט זמני לא זמין. אנא נסה שוב.";
const RATE_LIMIT_MESSAGE = "שירות הצ'אט זמני לא זמין בשל עומס. אנא נסה שוב בעוד מספר דקות.";

function streamError(error?: unknown): StreamChunk {
  const details = error && typeof error === "object" ? (error as Record<string, unknown>) : {};
  const nested = details.error && typeof details.error === "object" ? (details.error as Record<string, unknown>) : {};
  const code = String(details.code ?? details.status ?? nested.code ?? "");
  const rateLimited = code === "429" || /\b429\b/.test(String(details.message ?? nested.message ?? ""));
  const message = rateLimited ? RATE_LIMIT_MESSAGE : UNAVAILABLE_MESSAGE;
  return {
    type: EventType.RUN_ERROR,
    timestamp: Date.now(),
    message,
    code: rateLimited ? "429" : "CHAT_FAILED",
  };
}

export async function createChatResponse(request: Request, createStream: ChatStreamFactory): Promise<Response> {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid chat request" }, { status: 400 });
  }
  const parsed = chatRequestSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Invalid chat request" }, { status: 400 });
  const messages = getMinimalHistory(parsed.data.messages);
  const abortController = new AbortController();
  const abort = () => abortController.abort(request.signal.reason);
  if (request.signal.aborted) abort();
  else request.signal.addEventListener("abort", abort, { once: true });

  async function* chunks(): AsyncGenerator<StreamChunk> {
    try {
      if (abortController.signal.aborted) return;
      for await (const chunk of createStream(messages, abortController)) {
        if (abortController.signal.aborted) return;
        if (chunk.type === EventType.RUN_ERROR) {
          yield streamError(chunk);
          return;
        }
        yield chunk;
        if (chunk.type === EventType.RUN_FINISHED) return;
      }
      if (!abortController.signal.aborted) yield streamError();
    } catch (error) {
      if (!abortController.signal.aborted) yield streamError(error);
    } finally {
      request.signal.removeEventListener("abort", abort);
    }
  }
  return toServerSentEventsResponse(chunks(), {
    abortController,
    headers: { "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" },
  });
}
