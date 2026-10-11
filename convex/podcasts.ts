import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action, internalAction, internalMutation, query } from "./_generated/server";
import { withRefreshLease } from "./cache";
import { extractEpisodeNumber, fetchAndParseRSS, PODCAST_RSS_URLS } from "./rss";

export const podcastNameValidator = v.union(v.literal("hakapit"), v.literal("nitk"), v.literal("balcony-albums"));

export const getPodcastWithEpisodes = query({
  args: {
    name: podcastNameValidator,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) {
      throw new Error("limit must be a safe integer between 1 and 1000");
    }

    const podcast = await ctx.db
      .query("podcasts")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (!podcast) return null;

    const episodes = await ctx.db
      .query("episodes")
      .withIndex("by_podcastId_and_number", (q) => q.eq("podcastId", podcast._id))
      .order("desc");
    const rows = await episodes.take(limit + 1);
    const hasMore = rows.length > limit;

    return {
      ...podcast,
      episodes: rows.slice(0, limit).map((episode) => ({
        ...episode,
        podcast: { name: podcast.name },
      })),
      hasMore,
      paginationVersion: 1 as const,
    };
  },
});

export const getEpisodesPage = query({
  args: {
    name: podcastNameValidator,
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    if (
      !Number.isInteger(args.paginationOpts.numItems) ||
      args.paginationOpts.numItems < 1 ||
      args.paginationOpts.numItems > 100
    ) {
      throw new Error("paginationOpts.numItems must be an integer between 1 and 100");
    }

    const podcast = await ctx.db
      .query("podcasts")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (!podcast) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const result = await ctx.db
      .query("episodes")
      .withIndex("by_podcastId_and_number", (q) => q.eq("podcastId", podcast._id))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map((episode) => ({
        ...episode,
        podcast: { name: podcast.name },
      })),
    };
  },
});

export const getLatestEpisode = query({
  args: { podcastName: podcastNameValidator },
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
        podcast: { name: podcast.name },
      };
    }

    const latestByPublishedAt = await ctx.db
      .query("episodes")
      .withIndex("by_podcastId_and_publishedAt", (q) => q.eq("podcastId", podcast._id))
      .order("desc")
      .first();
    if (!latestByPublishedAt) return null;

    return {
      ...latestByPublishedAt,
      podcast: { name: podcast.name },
    };
  },
});

export const getEpisodeByNumber = query({
  args: {
    podcastName: podcastNameValidator,
    episodeNumber: v.number(),
  },
  handler: async (ctx, args) => {
    if (!Number.isSafeInteger(args.episodeNumber) || args.episodeNumber <= 0) {
      throw new Error("episodeNumber must be a positive integer");
    }

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
  args: { podcastName: podcastNameValidator },
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
  args: { podcastName: podcastNameValidator },
  handler: async (ctx, args): Promise<{ synced: boolean }> => {
    if (!PODCAST_RSS_URLS[args.podcastName]) {
      throw new Error(`Unknown podcast: ${args.podcastName}`);
    }

    const cacheKey = rssCacheKey(args.podcastName);
    const result = await withRefreshLease<{ synced: number }>(ctx, {
      key: cacheKey,
      dataType: cacheKey,
      source: "rss",
      requirePayload: false,
      refresh: async (): Promise<{ synced: number } | null> =>
        ctx.runAction(internal.podcasts.syncFeedFromRSS, { podcastName: args.podcastName }),
      expiresAt: (_, now) => now + RSS_CACHE_TTL_MS,
    });
    if (result.status === "failed") {
      throw result.error instanceof Error ? result.error : new Error("RSS refresh failed");
    }
    return { synced: result.status === "refreshed" };
  },
});

export const upsertPodcast = internalMutation({
  args: {
    name: podcastNameValidator,
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
    podcastName: podcastNameValidator,
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
    if (!Number.isSafeInteger(args.episodeNumber) || args.episodeNumber <= 0) {
      throw new Error("episodeNumber must be a positive integer");
    }

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
