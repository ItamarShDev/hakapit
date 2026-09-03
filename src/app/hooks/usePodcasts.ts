import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { isConvexAvailable } from "~/app/providers/convex/env";

import type { PodcastName } from "~/app/providers/rss/feed";
import type { Episode, PodcastWithEpisodes } from "~/app/utils";

export function usePodcastWithEpisodes(name: PodcastName, limit?: number): PodcastWithEpisodes | undefined {
  if (!isConvexAvailable()) return undefined;
  return useQuery(api.podcasts.getPodcastWithEpisodes, { name, limit }) as PodcastWithEpisodes | undefined;
}

export function useLatestEpisode(podcastName: PodcastName): Episode | undefined {
  if (!isConvexAvailable()) return undefined;
  return useQuery(api.podcasts.getLatestEpisode, { podcastName }) as Episode | undefined;
}
