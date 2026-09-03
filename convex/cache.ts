import { v } from "convex/values";

import { internalMutation, internalQuery } from "./_generated/server";

import type { MutationCtx, QueryCtx } from "./_generated/server";

export function getCacheEntry(ctx: QueryCtx, dataType: string) {
  return ctx.db
    .query("cacheTracking")
    .withIndex("by_dataType", (q) => q.eq("dataType", dataType))
    .first();
}

export async function readCachedJson(ctx: QueryCtx, dataType: string, opts: { allowStale?: boolean } = {}) {
  const entry = await getCacheEntry(ctx, dataType);
  if (!entry?.payload) return null;
  if (!opts.allowStale && entry.expiresAt !== undefined && entry.expiresAt <= Date.now()) return null;
  try {
    return JSON.parse(entry.payload);
  } catch (err) {
    console.warn(`Failed to parse ${dataType} cache`, err);
    return null;
  }
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

export const isCacheExpired = internalQuery({
  args: { dataType: v.string() },
  handler: async (ctx, args) => {
    const cache = await getCacheEntry(ctx, args.dataType);

    if (!cache) return { expired: true, exists: false };

    const now = Date.now();
    const expired = cache.expiresAt === undefined || cache.expiresAt <= now;

    return {
      expired,
      exists: true,
      lastUpdated: cache.lastUpdated,
      expiredAt: cache.expiresAt,
    };
  },
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
