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

    const totalEpisodes = await ctx.db
      .query("episodes")
      .withIndex("by_podcastId_and_number", (q) =>
        q.eq("podcastId", podcast._id),
      )
      .collect()
      .then((all) => all.length);

    const episodesQuery = ctx.db
      .query("episodes")
      .withIndex("by_podcastId_and_number", (q) =>
        q.eq("podcastId", podcast._id),
      )
      .order("desc");

    const episodes =
      args.limit && args.limit > 0
        ? await episodesQuery.take(args.limit)
        : await episodesQuery.collect();

    return {
      ...podcast,
      episodes: episodes.map((episode) => ({
        ...episode,
        podcast,
      })),
      totalEpisodes,
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

    const latestByNumber = await ctx.db
      .query("episodes")
      .withIndex("by_podcastId_and_number", (q) =>
        q.eq("podcastId", podcast._id).gt("episodeNumber", 0),
      )
      .order("desc")
      .first();

    if (latestByNumber) {
      return {
        ...latestByNumber,
        podcast,
      };
    }

    const allEpisodes = await ctx.db
      .query("episodes")
      .withIndex("by_podcastId", (q) => q.eq("podcastId", podcast._id))
      .collect();

    if (allEpisodes.length === 0) return null;

    const latestByPublishedAt = allEpisodes.reduce((best, current) => {
      const bestPublishedAt = best.publishedAt ?? 0;
      const currentPublishedAt = current.publishedAt ?? 0;
      return currentPublishedAt > bestPublishedAt ? current : best;
    }, allEpisodes[0]);

    return {
      ...latestByPublishedAt,
      podcast,
    };
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

    const episode = await ctx.db
      .query("episodes")
      .withIndex("by_podcastId_and_number", (q) =>
        q.eq("podcastId", podcast._id).eq("episodeNumber", args.episodeNumber),
      )
      .first();

    if (!episode) return null;
    return {
      ...episode,
      podcast: {
        name: podcast.name,
      },
    };
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
    if (!args.title?.trim()) {
      throw new Error(
        `upsertPodcast: 'title' is required (name='${args.name}')`,
      );
    }
    if (args.name.startsWith(".")) {
      throw new Error(`upsertPodcast: invalid podcast name '${args.name}'`);
    }

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

    const existing = await ctx.db
      .query("episodes")
      .withIndex("by_podcastId_and_number", (q) =>
        q.eq("podcastId", podcast._id).eq("episodeNumber", args.episodeNumber),
      )
      .first();

    const episodeData = {
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
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, episodeData);
      return existing._id;
    }

    return await ctx.db.insert("episodes", {
      ...episodeData,
      createdAt: now,
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

    const oneHourAgo = Date.now() - 5 * 60 * 1000;
    return {
      wasUpdatedRecently: podcast.updatedAt > oneHourAgo,
      lastUpdate: podcast.updatedAt,
    };
  },
});
