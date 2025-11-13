import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get podcast by name
export const getPodcastByName = query({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.name))
			.first();
	},
});

// Get podcast with episodes
export const getPodcastWithEpisodes = query({
	args: {
		name: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const podcast = await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.name))
			.first();

		if (!podcast) return null;

		const episodesQuery = ctx.db
			.query("episodes")
			.withIndex("by_podcastId", (q) => q.eq("podcastId", podcast._id))
			.order("desc");

		const episodes =
			args.limit && args.limit > 0 ? await episodesQuery.take(args.limit) : await episodesQuery.collect();

		return {
			...podcast,
			episodes,
		};
	},
});

// Get latest episode for a podcast
export const getLatestEpisode = query({
	args: { podcastName: v.string() },
	handler: async (ctx, args) => {
		const podcast = await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.podcastName))
			.first();

		if (!podcast) return null;

		return await ctx.db
			.query("episodes")
			.withIndex("by_podcastId", (q) => q.eq("podcastId", podcast._id))
			.order("desc")
			.first();
	},
});

// Get episode by number
export const getEpisodeByNumber = query({
	args: {
		podcastName: v.string(),
		episodeNumber: v.number(),
	},
	handler: async (ctx, args) => {
		const podcast = await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.podcastName))
			.first();

		if (!podcast) return null;

		return await ctx.db
			.query("episodes")
			.withIndex("by_podcastId_and_number", (q) =>
				q.eq("podcastId", podcast._id).eq("episodeNumber", args.episodeNumber),
			)
			.first();
	},
});

// Create or update podcast
export const upsertPodcast = mutation({
	args: {
		name: v.string(),
		title: v.string(),
		link: v.optional(v.string()),
		description: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
		feedUrl: v.optional(v.string()),
		authorName: v.optional(v.string()),
		authorEmail: v.optional(v.string()),
		authorSummary: v.optional(v.string()),
		authorImageUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.name))
			.first();

		const now = Date.now();
		const podcastData = {
			...args,
			updatedAt: now,
		};

		if (existing) {
			await ctx.db.patch(existing._id, podcastData);
			return existing._id;
		}
		return await ctx.db.insert("podcasts", {
			...podcastData,
			createdAt: now,
		});
	},
});

// Create episode
export const createEpisode = mutation({
	args: {
		podcastName: v.string(),
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
	},
	handler: async (ctx, args) => {
		const podcast = await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.podcastName))
			.first();

		if (!podcast) {
			throw new Error(`Podcast not found: ${args.podcastName}`);
		}

		const now = Date.now();
		return await ctx.db.insert("episodes", {
			episodeNumber: args.episodeNumber,
			guid: args.guid,
			title: args.title,
			link: args.link,
			description: args.description,
			htmlDescription: args.htmlDescription,
			imageUrl: args.imageUrl,
			audioUrl: args.audioUrl,
			publishedAt: args.publishedAt,
			duration: args.duration,
			podcastId: podcast._id,
			createdAt: now,
			updatedAt: now,
		});
	},
});

// Get all podcasts
export const getAllPodcasts = query({
	handler: async (ctx) => {
		return await ctx.db.query("podcasts").collect();
	},
});

// Check if podcast was updated recently
export const getPodcastUpdateStatus = query({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		const podcast = await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.name))
			.first();

		if (!podcast) return null;

		const oneHourAgo = Date.now() - 60 * 60 * 1000;
		return {
			wasUpdatedRecently: podcast.updatedAt > oneHourAgo,
			lastUpdate: podcast.updatedAt,
		};
	},
});
