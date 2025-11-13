import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Clear transfer photo field
export const clearTransferPhoto = mutation({
	args: {
		transferId: v.id("transfers"),
	},
	handler: async (ctx, args) => {
		const transfer = await ctx.db.get(args.transferId);
		if (!transfer) {
			throw new Error("Transfer not found");
		}

		// Create a new object without the playerPhoto field
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { playerPhoto, ...transferWithoutPhoto } = transfer;

		// Use replace instead of patch to actually remove the field
		await ctx.db.replace(args.transferId, transferWithoutPhoto);

		return { success: true };
	},
});

// Get all transfers
export const getAllTransfers = query({
	handler: async (ctx) => {
		return await ctx.db.query("transfers").collect();
	},
});

// Get transfer by player ID
export const getTransferByPlayerId = query({
	args: { playerId: v.number() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("transfers")
			.withIndex("by_playerId", (q) => q.eq("playerId", args.playerId))
			.first();
	},
});

// Get transfers by team ID
export const getTransfersByTeamId = query({
	args: { teamId: v.number() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("transfers")
			.withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
			.collect();
	},
});

// Create or update transfer
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
		direction: v.string(), // "IN" or "OUT"
		action: v.string(), // "BUY" or "SELL"
		price: v.optional(v.string()), // Transfer fee amount
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

// Get fetch time
export const getFetchTime = query({
	handler: async (ctx) => {
		const fetchTimeRecord = await ctx.db.query("fetchTime").first();
		return fetchTimeRecord?.updatedAt || null;
	},
});

// Update fetch time
export const updateFetchTime = mutation({
	handler: async (ctx) => {
		const existing = await ctx.db.query("fetchTime").first();

		if (existing) {
			await ctx.db.patch(existing._id, {
				updatedAt: Date.now(),
			});
			return existing._id;
		}
		return await ctx.db.insert("fetchTime", {
			updatedAt: Date.now(),
		});
	},
});

// Delete transfer
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
