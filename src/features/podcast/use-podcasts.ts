import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { isConvexAvailable } from "~/server/convex-client";

import type { Episode, PodcastWithEpisodes } from "~/features/podcast/types";
import type { PodcastName } from "~/server/rss/feed";

export function usePodcastWithEpisodes(name: PodcastName, limit?: number): PodcastWithEpisodes | undefined {
  if (!isConvexAvailable()) return undefined;
  return useQuery(api.podcasts.getPodcastWithEpisodes, { name, limit }) as PodcastWithEpisodes | undefined;
}

export function useLatestEpisode(podcastName: PodcastName): Episode | undefined {
  if (!isConvexAvailable()) return undefined;
  return useQuery(api.podcasts.getLatestEpisode, { podcastName }) as Episode | undefined;
}
