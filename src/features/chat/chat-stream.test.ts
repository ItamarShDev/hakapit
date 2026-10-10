import { expect, it } from "bun:test";

import { readChatStream } from "./chat-stream";
it("parses split UTF-8 SSE chunks and CRLF delimiters", async () => {
  const bytes = new TextEncoder().encode(
    'data: {"type":"TEXT_MESSAGE_CONTENT","delta":"שלום"}\r\n\r\ndata: [DONE]\r\n\r\n',
  );
  const response = new Response(
    new ReadableStream({
      start(controller) {
        for (let i = 0; i < bytes.length; i += 3) controller.enqueue(bytes.slice(i, i + 3));
        controller.close();
      },
    }),
  );
  const chunks: Record<string, unknown>[] = [];
  await readChatStream(response, (chunk) => chunks.push(chunk));
  expect(chunks).toEqual([{ type: "TEXT_MESSAGE_CONTENT", delta: "שלום" }]);
});
it("surfaces JSON errors from chat API failures", async () => {
  await expect(readChatStream(Response.json({ error: "unavailable" }, { status: 503 }), () => {})).rejects.toThrow(
    "unavailable",
  );
});
