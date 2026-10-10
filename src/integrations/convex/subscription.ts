import { ConvexClient } from "convex/browser";
import { type FunctionReference, type FunctionArgs, type FunctionReturnType } from "convex/server";
import { type Handle } from "remix/component";

import { ConvexProvider } from "~/integrations/convex/provider";
const clients = new Map<string, ConvexClient>();
export function subscribe<Query extends FunctionReference<"query">>(
  handle: Pick<Handle, "queueTask" | "signal" | "update" | "context">,
  query: Query,
  args: FunctionArgs<Query> | (() => FunctionArgs<Query>),
) {
  let data: FunctionReturnType<Query> | undefined;
  let unsubscribe: (() => void) | undefined;
  let activeKey: string | undefined;
  let generation = 0;
  function parameters() {
    return {
      url: handle.context.get(ConvexProvider)?.url ?? import.meta.env?.VITE_CONVEX_URL,
      args: typeof args === "function" ? (args as () => FunctionArgs<Query>)() : args,
    };
  }
  function refresh() {
    const { url, args } = parameters();
    if (typeof window === "undefined" || !url || handle.signal.aborted) return;
    activeKey = JSON.stringify([url, args]);
    const current = ++generation;
    let client = clients.get(url);
    if (!client) {
      client = new ConvexClient(url);
      clients.set(url, client);
    }
    unsubscribe?.();
    unsubscribe = client.onUpdate(
      query,
      args,
      (value) => {
        if (current !== generation || handle.signal.aborted) return;
        data = value;
        handle.update();
      },
      (error) => console.warn("Convex subscription failed", error),
    );
  }
  handle.signal.addEventListener(
    "abort",
    () => {
      generation++;
      unsubscribe?.();
    },
    { once: true },
  );
  return Object.assign(
    () => {
      const { url, args } = parameters();
      const key = JSON.stringify([url, args]);
      if (key !== activeKey) {
        activeKey = key;
        generation++;
        data = undefined;
        handle.queueTask(refresh);
      }
      return data;
    },
    { refresh },
  );
}
