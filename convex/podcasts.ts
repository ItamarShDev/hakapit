import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action, internalAction, internalMutation, query } from "./_generated/server";
import { extractEpisodeNumber, fetchAndParseRSS, PODCAST_RSS_URLS } from "./rss";

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
      .withIndex("by_podcastId_and_number", (q) => q.eq("podcastId", podcast._id))
      .collect()
      .then((all) => all.length);

    const episodesQuery = ctx.db
      .query("episodes")
      .withIndex("by_podcastId_and_number", (q) => q.eq("podcastId", podcast._id))
      .order("desc");

    const episodes =
      args.limit && args.limit > 0 ? await episodesQuery.take(args.limit) : await episodesQuery.collect();

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
      .withIndex("by_podcastId_and_number", (q) => q.eq("podcastId", podcast._id).gt("episodeNumber", 0))
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

const RSS_CACHE_TTL_MS = 5 * 60 * 1000;

function rssCacheKey(podcastName: string) {
  return `podcast-rss-${podcastName}`;
}

export const syncFeedFromRSS = internalAction({
  args: { podcastName: v.string() },
  handler: async (ctx, args) => {
    const rssUrl = PODCAST_RSS_URLS[args.podcastName];
    if (!rssUrl) {
      console.error(`No RSS URL configured for podcast: ${args.podcastName}`);
      return null;
    }

    const feed = await fetchAndParseRSS(rssUrl);
    if (!feed?.title) {
      console.error(`Failed to fetch RSS for: ${args.podcastName}`);
      return null;
    }

    await ctx.runMutation(internal.podcasts.upsertPodcast, {
      name: args.podcastName,
      title: feed.title,
      link: feed.link,
      feedUrl: feed.feedUrl,
      description: feed.description,
      imageUrl: feed.itunes?.image,
      authorName: feed.itunes?.owner?.name,
      authorEmail: feed.itunes?.owner?.email,
      authorSummary: feed.itunes?.summary,
      authorImageUrl: feed.itunes?.image,
    });

    let synced = 0;
    for (const item of feed.items) {
      const episodeNumber = extractEpisodeNumber(item.title || "");
      if (episodeNumber === 0) continue;

      await ctx.runMutation(internal.podcasts.createEpisode, {
        podcastName: args.podcastName,
        episodeNumber,
        guid: item.guid?.split("/").pop(),
        title: item.title || "",
        link: item.link,
        description: item.contentSnippet,
        htmlDescription: item.content,
        imageUrl: item.itunes?.image,
        audioUrl: item.enclosure?.url || "",
        publishedAt: item.isoDate ? new Date(item.isoDate).getTime() : undefined,
        duration: item.itunes?.duration,
      });
      synced++;
    }

    console.log(`RSS sync for ${args.podcastName}: ${synced} episodes`);
    return { synced };
  },
});

export const ensureFeedFresh = action({
  args: { podcastName: v.string() },
  handler: async (ctx, args) => {
    if (!PODCAST_RSS_URLS[args.podcastName]) {
      throw new Error(`Unknown podcast: ${args.podcastName}`);
    }

    const cacheKey = rssCacheKey(args.podcastName);
    const cacheStatus = await ctx.runQuery(internal.cache.isCacheExpired, { dataType: cacheKey });
    if (!cacheStatus.expired) return { synced: false };

    const result = await ctx.runAction(internal.podcasts.syncFeedFromRSS, { podcastName: args.podcastName });
    if (!result) return { synced: false };

    await ctx.runMutation(internal.cache.updateCacheTracking, {
      dataType: cacheKey,
      source: "rss",
      expiresAt: Date.now() + RSS_CACHE_TTL_MS,
    });
    return { synced: true };
  },
});

export const upsertPodcast = internalMutation({
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
      throw new Error(`upsertPodcast: 'title' is required (name='${args.name}')`);
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

export const createEpisode = internalMutation({
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
