import { expect, test } from "bun:test";
import { convexTest } from "convex-test";

import { api, internal } from "./_generated/api";
import { parseCachedJson, withRefreshLease } from "./cache";
import schema from "./schema";

import type { Id } from "./_generated/dataModel";
import type { ActionCtx } from "./_generated/server";

const modules = {
  "./_generated/api.js": () => import("./_generated/api"),
  "./admin.ts": () => import("./admin"),
  "./cache.ts": () => import("./cache"),
  "./football.ts": () => import("./football"),
  "./podcasts.ts": () => import("./podcasts"),
  "./rss.ts": () => import("./rss"),
  "./transfers.ts": () => import("./transfers"),
};

const createTest = () => convexTest(schema, modules);
const actionContext = (t: ReturnType<typeof createTest>) =>
  ({
    runQuery: t.query.bind(t),
    runMutation: t.mutation.bind(t),
  }) as unknown as Pick<ActionCtx, "runQuery" | "runMutation">;

async function seedPodcast(name: "hakapit" | "nitk" | "balcony-albums", episodeNumbers: number[]) {
  const t = createTest();
  const podcastId = await t.run(async (ctx) => {
    const id = await ctx.db.insert("podcasts", {
      name,
      title: name,
      createdAt: 1,
      updatedAt: 1,
    });
    for (const episodeNumber of episodeNumbers) {
      await ctx.db.insert("episodes", {
        episodeNumber,
        title: `Episode ${episodeNumber}`,
        audioUrl: `https://example.test/${episodeNumber}.mp3`,
        publishedAt: episodeNumber * 1000,
        createdAt: 1,
        updatedAt: 1,
        podcastId: id,
      });
    }
    return id;
  });
  return { t, podcastId };
}

type Assert<T extends true> = T;
export type TransferWritesAreInternal = Assert<
  Extract<keyof typeof api.transfers, "clearTransferPhoto" | "upsertTransfer" | "deleteTransfer"> extends never
    ? true
    : false
>;

test("SSR episode reads are bounded, default to ten, and expose minimal metadata", async () => {
  const { t } = await seedPodcast(
    "hakapit",
    Array.from({ length: 12 }, (_, index) => index + 1),
  );
  const result = await t.query(api.podcasts.getPodcastWithEpisodes, { name: "hakapit" });

  expect(result?.episodes.map((episode) => episode.episodeNumber)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
  expect(result?.hasMore).toBe(true);
  expect(result?.paginationVersion).toBe(1);
  expect(result).not.toHaveProperty("totalEpisodes");
  expect(result?.episodes[0]?.podcast).toEqual({ name: "hakapit" });
  expect(result?.episodes[0]?.podcast).not.toHaveProperty("_id");

  await expect(t.query(api.podcasts.getPodcastWithEpisodes, { name: "hakapit", limit: 0 })).rejects.toThrow();
  await expect(t.query(api.podcasts.getPodcastWithEpisodes, { name: "hakapit", limit: 1001 })).rejects.toThrow();
  await expect(t.query(api.podcasts.getPodcastWithEpisodes, { name: "hakapit", limit: 1.5 })).rejects.toThrow();
});

test("cursor pages descend without duplicates and preserve page metadata", async () => {
  const { t } = await seedPodcast("nitk", [1, 2, 3, 4, 5]);
  const first = await t.query(api.podcasts.getEpisodesPage, {
    name: "nitk",
    paginationOpts: { numItems: 2, cursor: null },
  });
  const second = await t.query(api.podcasts.getEpisodesPage, {
    name: "nitk",
    paginationOpts: { numItems: 2, cursor: first.continueCursor },
  });

  expect(first.page.map((episode) => episode.episodeNumber)).toEqual([5, 4]);
  expect(first.isDone).toBe(false);
  expect(second.page.map((episode) => episode.episodeNumber)).toEqual([3, 2]);
  expect(second.page.every((episode) => episode.podcast?.name === "nitk")).toBe(true);
  expect(new Set([...first.page, ...second.page].map((episode) => episode._id)).size).toBe(4);
  expect(second).toHaveProperty("continueCursor");
  await expect(
    t.query(api.podcasts.getEpisodesPage, { name: "nitk", paginationOpts: { numItems: 0, cursor: null } }),
  ).rejects.toThrow();
  await expect(
    t.query(api.podcasts.getEpisodesPage, { name: "nitk", paginationOpts: { numItems: 101, cursor: null } }),
  ).rejects.toThrow();
});

test("missing podcasts return exhausted pages and latest fallback uses publishedAt", async () => {
  const { t } = await seedPodcast("balcony-albums", [0, -1, -2]);
  const empty = await t.query(api.podcasts.getEpisodesPage, {
    name: "hakapit",
    paginationOpts: { numItems: 5, cursor: null },
  });
  const latest = await t.query(api.podcasts.getLatestEpisode, { podcastName: "balcony-albums" });

  expect(empty).toEqual({ page: [], isDone: true, continueCursor: "" });
  expect(latest?.episodeNumber).toBe(0);
  expect(latest?.podcast).toEqual({ name: "balcony-albums" });
  await expect(
    t.query(api.podcasts.getEpisodeByNumber, { podcastName: "hakapit", episodeNumber: 0 }),
  ).rejects.toThrow();
});

test("transfer write functions are internal and mutations preserve document system fields", async () => {
  const t = createTest();
  const args = {
    playerId: 7,
    playerName: "Player",
    playerPhoto: "https://example.test/photo.jpg",
    date: 1,
    teamId: 64,
    teamName: "Liverpool",
    direction: "in",
    action: "transfer",
  };
  const transferId = (await t.mutation(internal.transfers.upsertTransfer, args)) as Id<"transfers">;
  const updatedId = await t.mutation(internal.transfers.upsertTransfer, { ...args, playerName: "Updated" });
  expect(updatedId).toBe(transferId);

  await t.mutation(internal.transfers.clearTransferPhoto, { transferId });
  const afterPhotoClear = await t.run((ctx) => ctx.db.get(transferId));
  expect(afterPhotoClear?.playerPhoto).toBeUndefined();
  expect(afterPhotoClear?._id).toBe(transferId);
  expect(afterPhotoClear?._creationTime).toBeNumber();

  expect(await t.mutation(internal.transfers.deleteTransfer, { playerId: 7 })).toEqual({ success: true });
  expect(await t.query(api.transfers.getTransferByPlayerId, { playerId: 7 })).toBeNull();
});

test("cache parser respects expiry, stale reads, and malformed payloads", () => {
  const cached = { payload: '{"value":1}', expiresAt: 200 };
  expect(parseCachedJson(cached, 100)).toEqual({ value: 1 });
  expect(parseCachedJson(cached, 200)).toBeNull();
  expect(parseCachedJson(cached, 200, true)).toEqual({ value: 1 });
  expect(parseCachedJson({ payload: "{bad", expiresAt: 300 }, 100)).toBeNull();
  expect(parseCachedJson({ expiresAt: 300 }, 100)).toBeNull();
  expect(parseCachedJson({ payload: "null", expiresAt: 300 }, 100)).toBeNull();
});

test("fresh caches and live leases cannot be claimed; invalid fresh soccer payloads remain repairable", async () => {
  const t = createTest();
  const futureExpiry = Date.now() + 60_000;
  await t.run(async (ctx) => {
    await ctx.db.insert("cacheTracking", {
      dataType: "fresh",
      source: "test",
      payload: '{"ok":true}',
      expiresAt: futureExpiry,
      lastUpdated: 1,
      createdAt: 1,
      updatedAt: 1,
    });
    await ctx.db.insert("cacheTracking", {
      dataType: "rss",
      source: "test",
      expiresAt: futureExpiry,
      lastUpdated: 1,
      createdAt: 1,
      updatedAt: 1,
    });
  });
  const fresh = await t.mutation(internal.cache.claimRefresh, {
    key: "fresh",
    dataType: "fresh",
    token: "fresh-token",
    requirePayload: true,
  });
  const rssFresh = await t.mutation(internal.cache.claimRefresh, {
    key: "rss",
    dataType: "rss",
    token: "rss-token",
    requirePayload: false,
  });
  const malformed = await t.mutation(internal.cache.claimRefresh, {
    key: "bad",
    dataType: "bad",
    token: "bad-token",
    requirePayload: true,
  });
  expect(fresh.claimed).toBe(false);
  expect(rssFresh.claimed).toBe(false);
  expect(malformed.claimed).toBe(true);

  for (const [index, payload] of [undefined, "not json", "null"].entries()) {
    const dataType = `invalid-${index}`;
    await t.run(async (ctx) => {
      await ctx.db.insert("cacheTracking", {
        dataType,
        source: "test",
        payload,
        expiresAt: futureExpiry,
        lastUpdated: 1,
        createdAt: 1,
        updatedAt: 1,
      });
    });
    const claim = await t.mutation(internal.cache.claimRefresh, {
      key: dataType,
      dataType,
      token: `token-${index}`,
      requirePayload: true,
    });
    expect(claim.claimed).toBe(true);
  }
});

test("refresh claims serialize concurrent owners and permit expired lease takeover", async () => {
  const t = createTest();
  const claimsStartedAt = Date.now();
  const claims = await Promise.all(
    ["a", "b"].map((token) =>
      t.mutation(internal.cache.claimRefresh, {
        key: "shared",
        dataType: "shared",
        token,
        requirePayload: true,
      }),
    ),
  );
  const claimsFinishedAt = Date.now();
  expect(claims.filter((claim) => claim.claimed)).toHaveLength(1);

  const claimedLock = await t.run((ctx) =>
    ctx.db
      .query("refreshLocks")
      .withIndex("by_key", (q) => q.eq("key", "shared"))
      .first(),
  );
  expect(claimedLock?.expiresAt).toBeGreaterThanOrEqual(claimsStartedAt + 120_000);
  expect(claimedLock?.expiresAt).toBeLessThanOrEqual(claimsFinishedAt + 120_000);
  await t.run(async (ctx) => {
    if (claimedLock) await ctx.db.patch(claimedLock._id, { expiresAt: Date.now() - 1 });
  });
  const takeoverStartedAt = Date.now();
  const takeover = await t.mutation(internal.cache.claimRefresh, {
    key: "shared",
    dataType: "shared",
    token: "takeover",
    requirePayload: true,
  });
  const takeoverFinishedAt = Date.now();
  expect(takeover.claimed).toBe(true);
  const takeoverLock = await t.run((ctx) =>
    ctx.db
      .query("refreshLocks")
      .withIndex("by_key", (q) => q.eq("key", "shared"))
      .first(),
  );
  expect(takeoverLock?.expiresAt).toBeGreaterThanOrEqual(takeoverStartedAt + 120_000);
  expect(takeoverLock?.expiresAt).toBeLessThanOrEqual(takeoverFinishedAt + 120_000);
});

test("stale owners cannot complete or delete a successor lease", async () => {
  const t = createTest();
  const owner = await t.mutation(internal.cache.claimRefresh, {
    key: "owned",
    dataType: "owned",
    token: "old-owner",
    requirePayload: true,
  });
  const oldLock = await t.run((ctx) =>
    ctx.db
      .query("refreshLocks")
      .withIndex("by_key", (q) => q.eq("key", "owned"))
      .first(),
  );
  await t.run(async (ctx) => {
    if (oldLock) await ctx.db.patch(oldLock._id, { expiresAt: Date.now() - 1 });
  });
  const successor = await t.mutation(internal.cache.claimRefresh, {
    key: "owned",
    dataType: "owned",
    token: "new-owner",
    requirePayload: true,
  });
  expect(owner.claimed).toBe(true);
  expect(successor.claimed).toBe(true);

  const rejected = await t.mutation(internal.cache.completeRefresh, {
    key: "owned",
    dataType: "owned",
    token: "old-owner",
    source: "old",
    payload: '{"owner":"old"}',
    expiresAt: 500_000,
  });
  expect(rejected.completed).toBe(false);
  expect(await t.mutation(internal.cache.releaseRefresh, { key: "owned", token: "old-owner" })).toEqual({
    released: false,
  });

  expect(
    await t.mutation(internal.cache.completeRefresh, {
      key: "owned",
      dataType: "owned",
      token: "new-owner",
      source: "new",
      payload: '{"owner":"new"}',
      expiresAt: 500_000,
    }),
  ).toEqual({ completed: true });
  const entry = await t.run((ctx) =>
    ctx.db
      .query("cacheTracking")
      .withIndex("by_dataType", (q) => q.eq("dataType", "owned"))
      .first(),
  );
  const lock = await t.run((ctx) =>
    ctx.db
      .query("refreshLocks")
      .withIndex("by_key", (q) => q.eq("key", "owned"))
      .first(),
  );
  expect(entry?.payload).toBe('{"owner":"new"}');
  expect(lock).toBeNull();
});

test("failed refresh cooldown retains stale cache without extending freshness", async () => {
  const t = createTest();
  const previousExpiry = Date.now() - 1;
  await t.run(async (ctx) => {
    await ctx.db.insert("cacheTracking", {
      dataType: "stale",
      source: "test",
      payload: '{"previous":true}',
      expiresAt: previousExpiry,
      lastUpdated: 1,
      createdAt: 1,
      updatedAt: 1,
    });
  });
  const claim = await t.mutation(internal.cache.claimRefresh, {
    key: "stale",
    dataType: "stale",
    token: "failure",
    requirePayload: true,
  });
  expect(claim.claimed).toBe(true);
  const releasedAt = Date.now();
  expect(await t.mutation(internal.cache.releaseRefresh, { key: "stale", token: "failure" })).toEqual({
    released: true,
  });
  const cooldown = await t.run((ctx) =>
    ctx.db
      .query("refreshLocks")
      .withIndex("by_key", (q) => q.eq("key", "stale"))
      .first(),
  );
  expect(cooldown?.expiresAt).toBeGreaterThanOrEqual(releasedAt + 30_000);
  expect(cooldown?.expiresAt).toBeLessThanOrEqual(Date.now() + 30_000);
  const duringCooldown = await t.mutation(internal.cache.claimRefresh, {
    key: "stale",
    dataType: "stale",
    token: "blocked",
    requirePayload: true,
  });
  await t.run(async (ctx) => {
    if (cooldown) await ctx.db.patch(cooldown._id, { expiresAt: Date.now() - 1 });
  });
  const afterCooldown = await t.mutation(internal.cache.claimRefresh, {
    key: "stale",
    dataType: "stale",
    token: "retry",
    requirePayload: true,
  });
  const entry = await t.run((ctx) =>
    ctx.db
      .query("cacheTracking")
      .withIndex("by_dataType", (q) => q.eq("dataType", "stale"))
      .first(),
  );
  expect(duringCooldown.claimed).toBe(false);
  expect(afterCooldown.claimed).toBe(true);
  expect(entry?.payload).toBe('{"previous":true}');
  expect(entry?.expiresAt).toBe(previousExpiry);
});

test("refresh lease orchestration serves stale to the loser and commits the single owner's result", async () => {
  const t = createTest();
  const oldSnapshot = { snapshot: "old" };
  await t.run(async (ctx) => {
    await ctx.db.insert("cacheTracking", {
      dataType: "snapshot",
      source: "test",
      payload: JSON.stringify(oldSnapshot),
      expiresAt: Date.now() - 1,
      lastUpdated: 1,
      createdAt: 1,
      updatedAt: 1,
    });
  });
  const ctx = actionContext(t);
  let resolveRefresh!: (value: { snapshot: string }) => void;
  let markRefreshStarted!: () => void;
  const refreshStarted = new Promise<void>((resolve) => {
    markRefreshStarted = resolve;
  });
  const refreshGate = new Promise<{ snapshot: string }>((resolve) => {
    resolveRefresh = resolve;
  });
  let refreshCalls = 0;
  const leaseOptions = {
    key: "snapshot",
    dataType: "snapshot",
    source: "test",
    requirePayload: true,
    expiresAt: (_value: { snapshot: string }, now: number) => now + 60_000,
    payload: (value: { snapshot: string }) => JSON.stringify(value),
  };
  const ownerPromise = withRefreshLease(ctx, {
    ...leaseOptions,
    refresh: () => {
      refreshCalls++;
      markRefreshStarted();
      return refreshGate;
    },
  });
  await refreshStarted;
  const loser = await withRefreshLease(ctx, {
    ...leaseOptions,
    refresh: async () => {
      refreshCalls++;
      return { snapshot: "unexpected" };
    },
  });
  expect(loser.status).toBe("busy");
  expect(loser.value).toEqual(oldSnapshot);

  resolveRefresh({ snapshot: "new" });
  const owner = await ownerPromise;
  expect(owner.status).toBe("refreshed");
  expect(owner.value).toEqual({ snapshot: "new" });
  expect(refreshCalls).toBe(1);
  const cache = await t.run((ctx) =>
    ctx.db
      .query("cacheTracking")
      .withIndex("by_dataType", (q) => q.eq("dataType", "snapshot"))
      .first(),
  );
  expect(cache?.payload).toBe('{"snapshot":"new"}');
  expect(
    await t.run((db) =>
      db.db
        .query("refreshLocks")
        .withIndex("by_key", (q) => q.eq("key", "snapshot"))
        .first(),
    ),
  ).toBeNull();
});

test("refresh lease orchestration returns stale data and creates cooldown after a rejected refresh", async () => {
  const t = createTest();
  const oldSnapshot = { snapshot: "old" };
  await t.run(async (ctx) => {
    await ctx.db.insert("cacheTracking", {
      dataType: "snapshot",
      source: "test",
      payload: JSON.stringify(oldSnapshot),
      expiresAt: Date.now() - 1,
      lastUpdated: 1,
      createdAt: 1,
      updatedAt: 1,
    });
  });
  const startedAt = Date.now();
  const result = await withRefreshLease(actionContext(t), {
    key: "snapshot",
    dataType: "snapshot",
    source: "test",
    requirePayload: true,
    refresh: async () => {
      throw new Error("offline fixture");
    },
    expiresAt: (_value: { snapshot: string }, now: number) => now + 60_000,
    payload: (value) => JSON.stringify(value),
  });
  const finishedAt = Date.now();
  expect(result.status).toBe("failed");
  expect(result.value).toEqual(oldSnapshot);
  const lock = await t.run((ctx) =>
    ctx.db
      .query("refreshLocks")
      .withIndex("by_key", (q) => q.eq("key", "snapshot"))
      .first(),
  );
  expect(lock?.expiresAt).toBeGreaterThanOrEqual(startedAt + 30_000);
  expect(lock?.expiresAt).toBeLessThanOrEqual(finishedAt + 30_000);
  const cache = await t.run((ctx) =>
    ctx.db
      .query("cacheTracking")
      .withIndex("by_dataType", (q) => q.eq("dataType", "snapshot"))
      .first(),
  );
  expect(cache?.payload).toBe(JSON.stringify(oldSnapshot));
});
