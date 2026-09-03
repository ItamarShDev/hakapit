import { api } from "convex/_generated/api";

import { getConvexClient } from "~/server/convex-client";

import type { PodcastName } from "~/features/podcast/podcasts";
import type { Episode, PodcastWithEpisodes } from "~/features/podcast/types";

const convex = getConvexClient("warn");

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
  if (!convex) return;
  try {
    await convex.action(api.podcasts.ensureFeedFresh, { podcastName });
  } catch (err) {
    console.warn(`Feed sync failed for ${podcastName}`, err);
  }
}

export async function fetchUpdatedFeed(podcast: PodcastName, limit = 5): Promise<PodcastWithEpisodes | null> {
  if (!convex) return null;
  await ensureFeedFresh(podcast);
  const result = await convex.query(api.podcasts.getPodcastWithEpisodes, {
    name: podcast,
    limit: limit > 0 ? limit : undefined,
  });
  if (!result) return null;
  return { ...result, episodes: result.episodes.map(sanitizeEpisode) };
}

export async function fetchUpdatedLatestEpisode(podcast: PodcastName): Promise<Episode | null> {
  if (!convex) return null;
  await ensureFeedFresh(podcast);
  const episode = await convex.query(api.podcasts.getLatestEpisode, { podcastName: podcast });
  return episode ? sanitizeEpisode(episode) : null;
}

export async function fetchEpisode(podcastName: PodcastName, episodeNumber: number): Promise<Episode | null> {
  if (!convex) return null;
  const episode = await convex.query(api.podcasts.getEpisodeByNumber, { podcastName, episodeNumber });
  return episode ? sanitizeEpisode(episode) : null;
}
