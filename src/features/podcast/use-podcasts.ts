import { api } from "convex/_generated/api";

import { useConvexQuery } from "~/integrations/convex/use-convex-query";

import type { Episode, PodcastWithEpisodes } from "~/features/podcast/types";
import type { PodcastName } from "~/server/rss/feed";

export function usePodcastWithEpisodes(name: PodcastName, limit?: number): PodcastWithEpisodes | undefined {
  return useConvexQuery(api.podcasts.getPodcastWithEpisodes, { name, limit }) as PodcastWithEpisodes | undefined;
}

export function useLatestEpisode(podcastName: PodcastName): Episode | undefined {
  return useConvexQuery(api.podcasts.getLatestEpisode, { podcastName }) as Episode | undefined;
}
