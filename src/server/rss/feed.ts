import { api } from "convex/_generated/api";

import { sliceFeedItems } from "./feed-utils";
import { getConvexClient } from "~/server/convex-client";
import { fetchRss } from "~/server/rss/fetch-rss";

import type { PodcastName } from "~/features/podcast/podcasts";
import type { Episode, PodcastWithEpisodes } from "~/features/podcast/types";
import type { EpisodeData, Feed } from "~/server/rss/types";

const convex = getConvexClient("warn");

const PODCAST_URLS: Record<PodcastName, string | undefined> = {
  hakapit: process.env.HAKAPIT_RSS,
  nitk: process.env.NITK_RSS,
  "balcony-albums": process.env.BALCONY_RSS,
};

function rssItemToEpisode(item: EpisodeData, podcastName: PodcastName): Episode {
  return {
    episodeNumber: item.number ?? 0,
    guid: item.episodeGUID ?? item.guid,
    title: item.title ?? "",
    link: item.link,
    description: item.contentSnippet ?? null,
    htmlDescription: item.content ?? null,
    imageUrl: item.itunes?.image ?? null,
    audioUrl: item.enclosure?.url || "",
    publishedAt: item.isoDate ? new Date(item.isoDate).getTime() : null,
    duration: item.itunes?.duration ?? null,
    podcast: { name: podcastName },
  };
}

function rssFeedToPodcast(feed: Feed, podcastName: PodcastName, limit = 0): PodcastWithEpisodes {
  const episodes = feed.items
    .map((item) => rssItemToEpisode(item, podcastName))
    .slice(0, limit > 0 ? limit : undefined);

  return {
    name: podcastName,
    title: feed.title,
    description: feed.description ?? null,
    feedUrl: feed.feedUrl,
    imageUrl: feed.itunes?.image ?? null,
    authorName: feed.itunes?.owner?.name ?? null,
    authorEmail: feed.itunes?.owner?.email ?? null,
    authorSummary: feed.itunes?.summary ?? null,
    authorImageUrl: feed.itunes?.image ?? null,
    episodes,
    totalEpisodes: feed.items.length,
  };
}

function removeIframes(content: string): string {
  if (!content) return content;

  return content.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "");
}

function _fetch(podcast: PodcastName) {
  const url = PODCAST_URLS[podcast];
  return fetchRss(url);
}

async function fetchRSSFeed(podcast: PodcastName, number = 5): Promise<Feed> {
  const rss = await _fetch(podcast);
  return sliceFeedItems(rss as Feed, number);
}

export async function fetchFeed(podcast: PodcastName, number = 5): Promise<PodcastWithEpisodes | null> {
  if (!convex) {
    const feed = await fetchRSSFeed(podcast, number);
    return rssFeedToPodcast(feed, podcast, number);
  }
  const result = await convex.query(api.podcasts.getPodcastWithEpisodes, {
    name: podcast,
    limit: number > 0 ? number : undefined,
  });

  if (result?.episodes) {
    result.episodes = result.episodes.map((episode) => ({
      ...episode,
      description: removeIframes(episode.description || ""),
      htmlDescription: removeIframes(episode.htmlDescription || ""),
    }));
  }

  return result;
}

export async function fetchLatestEpisode(podcast: PodcastName): Promise<Episode | null> {
  if (!convex) {
    const feed = await fetchRSSFeed(podcast, 0);
    if (!feed?.items.length) return null;
    const sorted = [...feed.items].sort((a, b) => {
      const aTime = a.isoDate ? new Date(a.isoDate).getTime() : 0;
      const bTime = b.isoDate ? new Date(b.isoDate).getTime() : 0;
      return bTime - aTime;
    });
    return rssItemToEpisode(sorted[0], podcast);
  }
  const result = await convex.query(api.podcasts.getLatestEpisode, {
    podcastName: podcast,
  });

  return result;
}

export async function fetchUpdatedLatestEpisode(podcast: PodcastName): Promise<Episode | null> {
  if (!convex) return fetchLatestEpisode(podcast);

  const cacheKey = `podcast-rss-${podcast}`;
  const cacheStatus = await convex.query(api.cache.isCacheExpired, {
    dataType: cacheKey,
  });

  if (!cacheStatus.expired) {
    return await fetchLatestEpisode(podcast);
  }

  await updateFeedInDb(podcast);

  const oneHourFromNow = Date.now() + 5 * 60 * 1000;
  await convex.mutation(api.cache.updateCacheTracking, {
    dataType: cacheKey,
    source: "rss",
    expiresAt: oneHourFromNow,
  });

  return await fetchLatestEpisode(podcast);
}

export async function fetchEpisode({
  podcastName,
  episodeNumber,
}: {
  podcastName: string;
  episodeNumber: number;
}): Promise<Episode | null> {
  if (!convex) {
    const feed = await fetchRSSFeed(podcastName as PodcastName, 0);
    const item = feed.items.find((i) => i.number === episodeNumber);
    if (!item) return null;
    return rssItemToEpisode(item, podcastName as PodcastName);
  }
  return await convex.query(api.podcasts.getEpisodeByNumber, {
    podcastName,
    episodeNumber,
  });
}

async function updateFeedInDb(feedName: PodcastName) {
  if (!convex) return;

  const feed = await fetchRSSFeed(feedName, 0);
  if (!feed?.title) {
    return;
  }

  const existingPodcast = await convex.query(api.podcasts.getPodcastByName, {
    name: feedName,
  });

  await convex.mutation(api.podcasts.upsertPodcast, {
    name: feedName,
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

  const existingEpisodes = await convex.query(api.podcasts.getPodcastWithEpisodes, {
    name: feedName,
  });

  let newEpisodes = feed.items;
  if (existingPodcast && existingEpisodes?.episodes?.length && existingEpisodes.episodes.length > 0) {
    const latestEpisodeNumber = Math.max(...existingEpisodes.episodes.map((e) => e.episodeNumber));
    newEpisodes = feed.items.filter((episode) => episode.number > latestEpisodeNumber);
  }

  for (const episode of newEpisodes) {
    await convex.mutation(api.podcasts.createEpisode, {
      podcastName: feedName,
      episodeNumber: episode.number,
      guid: episode.episodeGUID,
      title: episode.title,
      link: episode.link,
      description: episode.contentSnippet,
      htmlDescription: episode.content,
      imageUrl: episode.itunes.image,
      audioUrl: episode.enclosure?.url || "",
      publishedAt: episode.isoDate ? new Date(episode.isoDate).getTime() : undefined,
      duration: episode.itunes.duration,
    });
  }

  const latestEpisode = await convex.query(api.podcasts.getLatestEpisode, {
    podcastName: feedName,
  });

  return { podcast: feedName, latestEpisode };
}

export async function fetchUpdatedFeed(podcast: PodcastName, number = 5): Promise<PodcastWithEpisodes | null> {
  if (!convex) {
    const feed = await fetchRSSFeed(podcast, number);
    return rssFeedToPodcast(feed, podcast, number);
  }

  const cacheKey = `podcast-rss-${podcast}`;

  const cacheStatus = await convex.query(api.cache.isCacheExpired, {
    dataType: cacheKey,
  });

  if (!cacheStatus.expired) {
    const result = await fetchFeed(podcast, number);
    if (result?.episodes) {
      result.episodes = result.episodes.map((episode) => ({
        ...episode,
        description: removeIframes(episode.description || ""),
        htmlDescription: removeIframes(episode.htmlDescription || ""),
      }));
    }
    return result;
  }

  await updateFeedInDb(podcast);

  const oneHourFromNow = Date.now() + 5 * 60 * 1000;
  await convex.mutation(api.cache.updateCacheTracking, {
    dataType: cacheKey,
    source: "rss",
    expiresAt: oneHourFromNow,
  });

  const result = await fetchFeed(podcast, number);

  if (result?.episodes) {
    result.episodes.sort((a, b) => b.episodeNumber - a.episodeNumber);
    result.episodes = result.episodes.map((episode) => ({
      ...episode,
      description: removeIframes(episode.description || ""),
      htmlDescription: removeIframes(episode.htmlDescription || ""),
    }));
  }

  return result;
}
