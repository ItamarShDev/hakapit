import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const clearTransferPhoto = mutation({
  args: {
    transferId: v.id("transfers"),
  },
  handler: async (ctx, args) => {
    const transfer = await ctx.db.get(args.transferId);
    if (!transfer) {
      throw new Error("Transfer not found");
    }

    const { playerPhoto: _playerPhoto, ...transferWithoutPhoto } = transfer;

    await ctx.db.replace(args.transferId, transferWithoutPhoto);

    return { success: true };
  },
});

export const getAllTransfers = query({
  handler: async (ctx) => {
    return await ctx.db.query("transfers").collect();
  },
});

export const getTransferByPlayerId = query({
  args: { playerId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transfers")
      .withIndex("by_playerId", (q) => q.eq("playerId", args.playerId))
      .first();
  },
});

export const getTransfersByTeamId = query({
  args: { teamId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transfers")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

export const upsertTransfer = mutation({
  args: {
    playerId: v.number(),
    playerName: v.string(),
    playerPhoto: v.optional(v.string()),
    date: v.number(),
    teamId: v.number(),
    teamName: v.string(),
    teamLogo: v.optional(v.string()),
    type: v.optional(v.string()),
    direction: v.string(),
    action: v.string(),
    price: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("transfers")
      .withIndex("by_playerId", (q) => q.eq("playerId", args.playerId))
      .first();

    const transferData = {
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, transferData);
      return existing._id;
    }
    return await ctx.db.insert("transfers", transferData);
  },
});

export const deleteTransfer = mutation({
  args: { playerId: v.number() },
  handler: async (ctx, args) => {
    const transfer = await ctx.db
      .query("transfers")
      .withIndex("by_playerId", (q) => q.eq("playerId", args.playerId))
      .first();

    if (transfer) {
      await ctx.db.delete(transfer._id);
      return { success: true };
    }

    return { success: false, message: "Transfer not found" };
  },
});
