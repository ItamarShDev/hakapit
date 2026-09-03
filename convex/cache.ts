import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getCacheTracking = query({
  args: { dataType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cacheTracking")
      .withIndex("by_dataType", (q) => q.eq("dataType", args.dataType))
      .first();
  },
});

export const updateCacheTracking = mutation({
  args: {
    dataType: v.string(),
    source: v.string(),
    metadata: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    payload: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cacheTracking")
      .withIndex("by_dataType", (q) => q.eq("dataType", args.dataType))
      .first();

    const now = Date.now();
    const cacheData = {
      ...args,
      lastUpdated: now,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, cacheData);
      return existing._id;
    }
    return await ctx.db.insert("cacheTracking", {
      ...cacheData,
      createdAt: now,
    });
  },
});

export const isCacheExpired = query({
  args: { dataType: v.string() },
  handler: async (ctx, args) => {
    const cache = await ctx.db
      .query("cacheTracking")
      .withIndex("by_dataType", (q) => q.eq("dataType", args.dataType))
      .first();

    if (!cache) return { expired: true, exists: false };

    const now = Date.now();
    const expired = cache.expiresAt ? cache.expiresAt < now : true;

    return {
      expired,
      exists: true,
      lastUpdated: cache.lastUpdated,
      expiredAt: cache.expiresAt,
    };
  },
});

export const cleanupExpiredCache = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const cacheEntries = await ctx.db.query("cacheTracking").collect();

    let cleanedCount = 0;
    for (const entry of cacheEntries) {
      if (entry.expiresAt && entry.expiresAt < now) {
        await ctx.db.delete(entry._id);
        cleanedCount++;
      }
    }

    return { cleanedCount };
  },
});

export const getAllCacheEntries = query({
  handler: async (ctx) => {
    return await ctx.db.query("cacheTracking").collect();
  },
});

export const clearCache = mutation({
  args: { dataType: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cacheTracking")
      .withIndex("by_dataType", (q) => q.eq("dataType", args.dataType))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        expiresAt: 0,
        lastUpdated: Date.now(),
        updatedAt: Date.now(),
      });
      return { cleared: true, dataType: args.dataType };
    }
    return { cleared: false, dataType: args.dataType };
  },
});
