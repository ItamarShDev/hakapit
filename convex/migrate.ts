import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Migration mutations to transfer data from PostgreSQL to Convex

// Migrate podcasts
export const migratePodcasts = mutation({
	handler: async (ctx) => {
		// This would be called with data from PostgreSQL
		// For now, let's create the structure for migration
		const existingPodcasts = await ctx.db.query("podcasts").collect();

		if (existingPodcasts.length > 0) {
			return {
				message: "Podcasts already migrated",
				count: existingPodcasts.length,
			};
		}

		// Sample migration data - replace with actual PostgreSQL data
		const podcastData = [
			{
				name: "hakapit",
				title: "Hakapit Podcast",
				link: "https://hakapit.online",
				description: "The official Hakapit podcast",
				imageUrl: "https://example.com/image.jpg",
				feedUrl: process.env.HAKAPIT_RSS,
				authorName: "Hakapit Team",
				createdAt: Date.now(),
				updatedAt: Date.now(),
			},
			{
				name: "nitk",
				title: "NITK Podcast",
				link: "https://nitk.example.com",
				description: "NITK official podcast",
				feedUrl: process.env.NITK_RSS,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			},
			{
				name: "balcony-albums",
				title: "Balcony Albums",
				link: "https://balcony.example.com",
				description: "Balcony albums podcast",
				feedUrl: process.env.BALCONY_RSS,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			},
		];

		const migratedPodcasts = [];
		for (const podcast of podcastData) {
			const id = await ctx.db.insert("podcasts", podcast);
			migratedPodcasts.push(id);
		}

		return {
			message: "Podcasts migrated successfully",
			count: migratedPodcasts.length,
		};
	},
});

// Migrate episodes
export const migrateEpisodes = mutation({
	args: {
		podcastName: v.string(),
		episodes: v.array(
			v.object({
				episodeNumber: v.number(),
				guid: v.optional(v.string()),
				title: v.string(),
				link: v.optional(v.string()),
				description: v.optional(v.string()),
				htmlDescription: v.optional(v.string()),
				imageUrl: v.optional(v.string()),
				audioUrl: v.string(),
				publishedAt: v.optional(v.number()),
				duration: v.optional(v.string()),
			}),
		),
	},
	handler: async (ctx, args) => {
		const podcast = await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.podcastName))
			.first();

		if (!podcast) {
			throw new Error(`Podcast not found: ${args.podcastName}`);
		}

		const migratedEpisodes = [];

		for (const episodeData of args.episodes) {
			const episode = {
				...episodeData,
				podcastId: podcast._id,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};

			const id = await ctx.db.insert("episodes", episode);
			migratedEpisodes.push(id);
		}

		return {
			message: "Episodes migrated successfully",
			count: migratedEpisodes.length,
		};
	},
});

// Migrate subscriptions
export const migrateSubscriptions = mutation({
	args: {
		subscriptions: v.array(
			v.object({
				podcast: v.string(),
				userId: v.string(),
				expirationTime: v.optional(v.number()),
				subscription: v.any(),
			}),
		),
	},
	handler: async (ctx, args) => {
		const migratedSubscriptions = [];

		for (const subData of args.subscriptions) {
			const subscription = {
				...subData,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};

			const id = await ctx.db.insert("subscriptions", subscription);
			migratedSubscriptions.push(id);
		}

		return {
			message: "Subscriptions migrated successfully",
			count: migratedSubscriptions.length,
		};
	},
});

// Migrate transfers
export const migrateTransfers = mutation({
	args: {
		transfers: v.array(
			v.object({
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
			}),
		),
	},
	handler: async (ctx, args) => {
		const migratedTransfers = [];

		for (const transferData of args.transfers) {
			const transfer = {
				...transferData,
				updatedAt: Date.now(),
			};

			const id = await ctx.db.insert("transfers", transfer);
			migratedTransfers.push(id);
		}

		return {
			message: "Transfers migrated successfully",
			count: migratedTransfers.length,
		};
	},
});

// Initialize fetch time
export const initializeFetchTime = mutation({
	handler: async (ctx) => {
		const existing = await ctx.db.query("fetchTime").collect();

		if (existing.length === 0) {
			await ctx.db.insert("fetchTime", {
				updatedAt: Date.now(),
			});
			return { message: "Fetch time initialized" };
		}

		return { message: "Fetch time already exists" };
	},
});

// Check migration status
export const getMigrationStatus = query({
	handler: async (ctx) => {
		const podcasts = await ctx.db.query("podcasts").collect();
		const episodes = await ctx.db.query("episodes").collect();
		const subscriptions = await ctx.db.query("subscriptions").collect();
		const transfers = await ctx.db.query("transfers").collect();
		const fetchTime = await ctx.db.query("fetchTime").collect();

		return {
			podcasts: podcasts.length,
			episodes: episodes.length,
			subscriptions: subscriptions.length,
			transfers: transfers.length,
			fetchTime: fetchTime.length,
		};
	},
});

// Get cache tracking by data type
export const getCacheByDataType = query({
	args: {
		dataType: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("cacheTracking")
			.withIndex("by_dataType", (q) => q.eq("dataType", args.dataType))
			.collect();
	},
});

// Upsert cache tracking
export const upsertCacheTracking = mutation({
	args: {
		dataType: v.string(),
		source: v.string(),
		lastUpdated: v.number(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("cacheTracking")
			.withIndex("by_dataType", (q) => q.eq("dataType", args.dataType))
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, {
				lastUpdated: args.lastUpdated,
				updatedAt: Date.now(),
			});
			return existing._id;
		}

		return await ctx.db.insert("cacheTracking", {
			dataType: args.dataType,
			source: args.source,
			lastUpdated: args.lastUpdated,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});
	},
});
