import { expect, spyOn, test } from "bun:test";

import { loadHomeSnapshot } from "./home-snapshot";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

test("starts homepage requests together and falls back independently", async () => {
  const snapshot = deferred<{ standings: string[] } | null>();
  const transfers = deferred<string[] | null>();
  const latestEpisode = deferred<string | null>();
  const started: string[] = [];
  const warn = spyOn(console, "warn").mockImplementation(() => {});

  try {
    const result = loadHomeSnapshot({
      snapshot: () => {
        started.push("snapshot");
        return snapshot.promise;
      },
      transfers: () => {
        started.push("transfers");
        return transfers.promise;
      },
      latestEpisode: () => {
        started.push("latestEpisode");
        return latestEpisode.promise;
      },
    });

    expect(started).toEqual(["snapshot", "transfers", "latestEpisode"]);
    transfers.resolve(["transfer"]);
    latestEpisode.reject(new Error("latest episode unavailable"));
    snapshot.resolve({ standings: ["Liverpool"] });

    expect(await result).toEqual({
      snapshot: { standings: ["Liverpool"] },
      transfers: ["transfer"],
      latestEpisode: null,
    });
    expect(warn).toHaveBeenCalledTimes(1);
  } finally {
    warn.mockRestore();
  }
});
