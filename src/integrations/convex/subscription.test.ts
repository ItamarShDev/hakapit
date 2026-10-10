import { afterAll, expect, it, mock } from "bun:test";
import { api } from "convex/_generated/api";

import type { Handle } from "remix/component";
const original = await import("convex/browser");
const calls: { args: unknown; callback: (value: unknown) => void; cancelled: boolean }[] = [];
mock.module("convex/browser", () => ({
  ...original,
  ConvexClient: class {
    onUpdate(_query: unknown, args: unknown, callback: (value: unknown) => void) {
      const call = { args, callback, cancelled: false };
      calls.push(call);
      return () => {
        call.cancelled = true;
      };
    }
  },
}));
const { subscribe } = await import("./subscription");
const previousWindow = globalThis.window;
Object.assign(globalThis, { window: previousWindow ?? {} });
afterAll(() => {
  mock.module("convex/browser", () => original);
  Object.assign(globalThis, { window: previousWindow });
});
it("re-subscribes when route parameters change and ignores stale updates", () => {
  const tasks: (() => void)[] = [];
  const controller = new AbortController();
  let updates = 0;
  const handle = {
    queueTask: (task: () => void) => tasks.push(task),
    signal: controller.signal,
    update: () => {
      updates++;
    },
    context: { get: () => ({ url: "https://fixture.convex.cloud" }) },
  } as unknown as Pick<Handle, "queueTask" | "signal" | "update" | "context">;
  let name = "hakapit";
  const live = subscribe(handle, api.podcasts.getPodcastWithEpisodes, () => ({ name, limit: 10 }));
  expect(live()).toBeUndefined();
  tasks.shift()?.();
  calls[0].callback({ episodes: [], totalEpisodes: 1 });
  expect(live()?.totalEpisodes).toBe(1);
  name = "nitk";
  expect(live()).toBeUndefined();
  calls[0].callback({ episodes: [], totalEpisodes: 99 });
  expect(live()).toBeUndefined();
  tasks.shift()?.();
  expect(calls[0].cancelled).toBe(true);
  expect(calls[1].args).toEqual({ name: "nitk", limit: 10 });
  calls[1].callback({ episodes: [], totalEpisodes: 2 });
  expect(live()?.totalEpisodes).toBe(2);
  expect(updates).toBe(2);
  controller.abort();
  expect(calls[1].cancelled).toBe(true);
});
