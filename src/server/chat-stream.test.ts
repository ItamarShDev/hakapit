import { EventType } from "@tanstack/ai";
import { expect, test } from "bun:test";

import { createChatResponse } from "./chat-stream";

import type { StreamChunk } from "@tanstack/ai";

const request = () =>
  new Request("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages: [{ role: "user", content: "Hello" }] }),
  });
const content: StreamChunk = { type: EventType.TEXT_MESSAGE_CONTENT, messageId: "m", delta: "Hello" };
const finished: StreamChunk = { type: EventType.RUN_FINISHED, threadId: "t", runId: "r" };

test("delivers a chunk before the provider finishes and does not truncate long replies", async () => {
  const gate = Promise.withResolvers<void>();
  let completed = false;
  const response = await createChatResponse(request(), async function* () {
    yield content;
    await gate.promise;
    for (let index = 0; index < 120; index++) yield content;
    completed = true;
    yield finished;
  });
  const reader = response.body!.getReader();
  try {
    expect(new TextDecoder().decode((await reader.read()).value)).toContain('"delta":"Hello"');
    expect(completed).toBe(false);
  } finally {
    gate.resolve();
  }
  let remainder = "";
  for (;;) {
    const next = await reader.read();
    if (next.done) break;
    remainder += new TextDecoder().decode(next.value);
  }
  expect(remainder.match(/TEXT_MESSAGE_CONTENT/g)?.length).toBe(120);
  expect(remainder).toContain("RUN_FINISHED");
  expect(remainder).not.toContain("RUN_ERROR");
});

test("encodes failures before or after partial output without leaking details or replaying chunks", async () => {
  for (const partial of [false, true]) {
    let attempts = 0;
    const response = await createChatResponse(request(), async function* () {
      attempts++;
      if (partial) yield content;
      throw new Error("private provider diagnostic");
    });
    const text = await response.text();
    expect(text).toContain("RUN_ERROR");
    expect(text).not.toContain("private provider diagnostic");
    expect(text.match(/TEXT_MESSAGE_CONTENT/g)?.length ?? 0).toBe(partial ? 1 : 0);
    expect(attempts).toBe(1);
  }
});

test("normalizes rate limits and flags an incomplete stream", async () => {
  const limited = await createChatResponse(request(), async function* () {
    yield { type: EventType.RUN_ERROR, message: "upstream 429", code: "429" };
  });
  expect(await limited.text()).toContain('"code":"429"');
  const incomplete = await createChatResponse(request(), async function* () {
    yield content;
  });
  expect(await incomplete.text()).toContain("RUN_ERROR");
});

test("cancelling the response aborts the provider and releases its iterator", async () => {
  let aborted = false;
  let released = false;
  const listenerReady = Promise.withResolvers<void>();
  const response = await createChatResponse(request(), async function* (_, controller) {
    try {
      const abortPromise = new Promise<void>((resolve) => {
        if (controller.signal.aborted) {
          aborted = true;
          resolve();
          return;
        }
        controller.signal.addEventListener(
          "abort",
          () => {
            aborted = true;
            resolve();
          },
          { once: true },
        );
        listenerReady.resolve();
      });
      yield content;
      await abortPromise;
    } finally {
      released = true;
    }
  });
  const reader = response.body!.getReader();
  await listenerReady.promise;
  await reader.read();
  await reader.cancel();
  expect(aborted).toBe(true);
  expect(released).toBe(true);
});

test("rejects invalid JSON and messages before starting a provider", async () => {
  for (const body of ["not json", JSON.stringify({ messages: [] })]) {
    let called = false;
    const response = await createChatResponse(
      new Request("http://localhost/api/chat", { method: "POST", body }),
      async function* () {
        called = true;
        yield finished;
      },
    );
    expect(response.status).toBe(400);
    expect(called).toBe(false);
  }
});
