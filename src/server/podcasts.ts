import { api } from "convex/_generated/api";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getConvexClient } from "~/server/convex-client";

import type { PodcastName } from "~/features/podcast/podcasts";
import type { Episode, PodcastWithEpisodes } from "~/features/podcast/types";

function stripIframes(html: string | null | undefined) {
  return html?.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "") ?? null;
}

function sanitizeEpisode<T extends Episode>(episode: T): T {
  return {
    ...episode,
    description: stripIframes(episode.description),
    htmlDescription: stripIframes(episode.htmlDescription),
  };
}

async function ensureFeedFresh(podcastName: PodcastName) {
  const convex = getConvexClient("warn");
  if (!convex) return;
  try {
    await convex.action(api.podcasts.ensureFeedFresh, { podcastName });
  } catch (err) {
    console.warn(`Feed sync failed for ${podcastName}`, err);
  }
}

async function fetchUpdatedFeedFromConvex(podcast: PodcastName, limit = 5): Promise<PodcastWithEpisodes | null> {
  const convex = getConvexClient("warn");
  if (!convex) return null;
  await ensureFeedFresh(podcast);
  const result = await convex.query(api.podcasts.getPodcastWithEpisodes, {
    name: podcast,
    limit: limit > 0 ? limit : undefined,
  });
  if (!result) return null;
  return { ...result, episodes: result.episodes.map(sanitizeEpisode) };
}

async function fetchUpdatedLatestEpisodeFromConvex(podcast: PodcastName): Promise<Episode | null> {
  const convex = getConvexClient("warn");
  if (!convex) return null;
  await ensureFeedFresh(podcast);
  const episode = await convex.query(api.podcasts.getLatestEpisode, { podcastName: podcast });
  return episode ? sanitizeEpisode(episode) : null;
}

async function fetchEpisodeFromConvex(podcastName: PodcastName, episodeNumber: number): Promise<Episode | null> {
  const convex = getConvexClient("warn");
  if (!convex) return null;
  const episode = await convex.query(api.podcasts.getEpisodeByNumber, { podcastName, episodeNumber });
  return episode ? sanitizeEpisode(episode) : null;
}

const podcastInput = z.object({
  podcast: z.enum(["hakapit", "balcony-albums", "nitk"]),
});

const feedInput = podcastInput.extend({
  limit: z.number().int().optional(),
});

const fetchUpdatedFeedServer = createServerFn({ method: "GET" })
  .validator(feedInput)
  .handler(({ data }) => fetchUpdatedFeedFromConvex(data.podcast, data.limit));

const fetchUpdatedLatestEpisodeServer = createServerFn({ method: "GET" })
  .validator(podcastInput)
  .handler(({ data }) => fetchUpdatedLatestEpisodeFromConvex(data.podcast));

const fetchEpisodeServer = createServerFn({ method: "GET" })
  .validator(
    podcastInput.extend({
      episodeNumber: z.number().int(),
    }),
  )
  .handler(({ data }) => fetchEpisodeFromConvex(data.podcast, data.episodeNumber));

export function fetchUpdatedFeed(podcast: PodcastName, limit = 5): Promise<PodcastWithEpisodes | null> {
  return fetchUpdatedFeedServer({ data: { podcast, limit } });
}

export function fetchUpdatedLatestEpisode(podcast: PodcastName): Promise<Episode | null> {
  return fetchUpdatedLatestEpisodeServer({ data: { podcast } });
}

export function fetchEpisode(podcastName: PodcastName, episodeNumber: number): Promise<Episode | null> {
  return fetchEpisodeServer({ data: { podcast: podcastName, episodeNumber } });
}
