import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalMutation, internalQuery } from "./_generated/server";

import type { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";

export type CacheTrackingEntry = {
  dataType: string;
  source: string;
  payload?: string;
  metadata?: string;
  expiresAt?: number;
  lastUpdated: number;
  createdAt: number;
  updatedAt: number;
};

export function getCacheEntry(ctx: QueryCtx, dataType: string) {
  return ctx.db
    .query("cacheTracking")
    .withIndex("by_dataType", (q) => q.eq("dataType", dataType))
    .first();
}

export function parseCachedJson(
  entry: Pick<CacheTrackingEntry, "payload" | "expiresAt"> | null | undefined,
  now: number,
  allowStale = false,
) {
  if (!entry?.payload) return null;
  if (!allowStale && entry.expiresAt !== undefined && entry.expiresAt <= now) return null;
  try {
    return JSON.parse(entry.payload);
  } catch {
    return null;
  }
}

function isFresh(
  entry: Pick<CacheTrackingEntry, "payload" | "expiresAt"> | null,
  now: number,
  requirePayload: boolean,
) {
  return (
    entry?.expiresAt !== undefined &&
    entry.expiresAt > now &&
    (!requirePayload || parseCachedJson(entry, now, true) !== null)
  );
}

export async function upsertCacheEntry(
  ctx: MutationCtx,
  entry: { dataType: string; source: string; metadata?: string; expiresAt?: number; payload?: string },
) {
  const existing = await getCacheEntry(ctx, entry.dataType);
  const now = Date.now();
  const cacheData = { ...entry, lastUpdated: now, updatedAt: now };
  if (existing) {
    await ctx.db.patch(existing._id, cacheData);
    return existing._id;
  }
  return await ctx.db.insert("cacheTracking", { ...cacheData, createdAt: now });
}

export const getCacheTracking = internalQuery({
  args: { dataType: v.string() },
  handler: (ctx, args) => getCacheEntry(ctx, args.dataType),
});

export const claimRefresh = internalMutation({
  args: {
    key: v.string(),
    dataType: v.string(),
    now: v.number(),
    token: v.string(),
    requirePayload: v.boolean(),
  },
  handler: async (ctx, args) => {
    const entry = await getCacheEntry(ctx, args.dataType);
    const lock = await ctx.db
      .query("refreshLocks")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (isFresh(entry, args.now, args.requirePayload)) {
      return { claimed: false, reason: "fresh" as const, entry };
    }
    if (lock && lock.expiresAt > args.now) {
      return { claimed: false, reason: "locked" as const, entry };
    }

    const lockData = { key: args.key, token: args.token, expiresAt: args.now + 120_000 };
    if (lock) {
      await ctx.db.patch(lock._id, lockData);
    } else {
      await ctx.db.insert("refreshLocks", lockData);
    }
    return { claimed: true, token: args.token, entry };
  },
});

export const completeRefresh = internalMutation({
  args: {
    key: v.string(),
    dataType: v.string(),
    token: v.string(),
    source: v.string(),
    metadata: v.optional(v.string()),
    payload: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const lock = await ctx.db
      .query("refreshLocks")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (!lock || lock.token !== args.token) return { completed: false };

    const entry: {
      dataType: string;
      source: string;
      metadata?: string;
      payload?: string;
      expiresAt?: number;
    } = {
      dataType: args.dataType,
      source: args.source,
      expiresAt: args.expiresAt,
    };
    if (args.metadata !== undefined) entry.metadata = args.metadata;
    if (args.payload !== undefined) entry.payload = args.payload;
    await upsertCacheEntry(ctx, entry);
    await ctx.db.delete(lock._id);
    return { completed: true };
  },
});

export const releaseRefresh = internalMutation({
  args: { key: v.string(), token: v.string(), now: v.number() },
  handler: async (ctx, args) => {
    const lock = await ctx.db
      .query("refreshLocks")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (!lock || lock.token !== args.token) return { released: false };
    await ctx.db.patch(lock._id, { expiresAt: args.now + 30_000 });
    return { released: true };
  },
});

export async function withRefreshLease<T>(
  ctx: ActionCtx,
  options: {
    key: string;
    dataType: string;
    source: string;
    requirePayload: boolean;
    refresh: () => Promise<T | null>;
    expiresAt: (value: T, now: number) => number;
    payload?: (value: T) => string | undefined;
    metadata?: (value: T) => string | undefined;
  },
): Promise<{ status: "fresh" | "busy" | "refreshed" | "failed"; value: T | null; error?: unknown }> {
  const now = Date.now();
  const entry = await ctx.runQuery(internal.cache.getCacheTracking, { dataType: options.dataType });
  if (isFresh(entry, now, options.requirePayload)) {
    return { status: "fresh", value: parseCachedJson(entry, now) as T };
  }

  const claim = await ctx.runMutation(internal.cache.claimRefresh, {
    key: options.key,
    dataType: options.dataType,
    now,
    token: `${now}-${Math.random()}`,
    requirePayload: options.requirePayload,
  });
  if (!claim.claimed || !claim.token) {
    return {
      status: "busy",
      value: parseCachedJson(claim.entry, Date.now(), true) as T | null,
    };
  }
  const token = claim.token;

  try {
    const value = await options.refresh();
    if (value === null) throw new Error("Refresh returned no data");
    const completion = await ctx.runMutation(internal.cache.completeRefresh, {
      key: options.key,
      dataType: options.dataType,
      token,
      source: options.source,
      expiresAt: options.expiresAt(value, Date.now()),
      payload: options.payload?.(value),
      metadata: options.metadata?.(value),
    });
    if (!completion.completed) {
      return {
        status: "busy",
        value: parseCachedJson(claim.entry, Date.now(), true) as T | null,
      };
    }
    return { status: "refreshed", value };
  } catch (error) {
    await ctx.runMutation(internal.cache.releaseRefresh, {
      key: options.key,
      token,
      now: Date.now(),
    });
    return {
      status: "failed",
      value: parseCachedJson(claim.entry, Date.now(), true) as T | null,
      error,
    };
  }
}

export const updateCacheTracking = internalMutation({
  args: {
    dataType: v.string(),
    source: v.string(),
    metadata: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    payload: v.optional(v.string()),
  },
  handler: (ctx, args) => upsertCacheEntry(ctx, args),
});

export const cleanupExpiredCache = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const cacheEntries = await ctx.db.query("cacheTracking").collect();

    let cleanedCount = 0;
    for (const entry of cacheEntries) {
      if (entry.expiresAt !== undefined && entry.expiresAt <= now) {
        await ctx.db.delete(entry._id);
        cleanedCount++;
      }
    }

    return { cleanedCount };
  },
});

export const clearCache = internalMutation({
  args: { dataType: v.string() },
  handler: async (ctx, args) => {
    const existing = await getCacheEntry(ctx, args.dataType);
    if (!existing) return { cleared: false };
    await ctx.db.patch(existing._id, { expiresAt: 0, lastUpdated: Date.now(), updatedAt: Date.now() });
    return { cleared: true };
  },
});
