import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get subscription by user ID
export const getSubscriptionByUserId = query({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("subscriptions")
			.withIndex("by_userId", (q) => q.eq("userId", args.userId))
			.first();
	},
});

// Get subscriptions by podcast
export const getSubscriptionsByPodcast = query({
	args: { podcast: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("subscriptions")
			.withIndex("by_podcast", (q) => q.eq("podcast", args.podcast))
			.collect();
	},
});

// Create or update subscription
export const upsertSubscription = mutation({
	args: {
		podcast: v.string(),
		userId: v.string(),
		expirationTime: v.optional(v.number()),
		subscription: v.any(), // PushSubscription object
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("subscriptions")
			.withIndex("by_userId", (q) => q.eq("userId", args.userId))
			.first();

		const subscriptionData = {
			...args,
			updatedAt: Date.now(),
		};

		if (existing) {
			await ctx.db.patch(existing._id, subscriptionData);
			return existing._id;
		}
		return await ctx.db.insert("subscriptions", {
			...subscriptionData,
			createdAt: Date.now(),
		});
	},
});

// Delete subscription
export const deleteSubscription = mutation({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		const subscription = await ctx.db
			.query("subscriptions")
			.withIndex("by_userId", (q) => q.eq("userId", args.userId))
			.first();

		if (subscription) {
			await ctx.db.delete(subscription._id);
			return { success: true };
		}

		return { success: false, message: "Subscription not found" };
	},
});

// Get all subscriptions
export const getAllSubscriptions = query({
	handler: async (ctx) => {
		return await ctx.db.query("subscriptions").collect();
	},
});

// Clean up expired subscriptions
export const cleanupExpiredSubscriptions = mutation({
	handler: async (ctx) => {
		const now = Date.now();
		const subscriptions = await ctx.db.query("subscriptions").collect();

		let cleanedCount = 0;
		for (const subscription of subscriptions) {
			if (subscription.expirationTime && subscription.expirationTime < now) {
				await ctx.db.delete(subscription._id);
				cleanedCount++;
			}
		}

		return { cleanedCount };
	},
});
