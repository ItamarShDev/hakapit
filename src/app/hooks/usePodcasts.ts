import { useQuery } from "convex/react";
import type { PodcastName } from "~/app/providers/rss/feed";
import { api } from "../../../convex/_generated/api";

// Hook to get podcast with episodes (real-time streaming)
export function usePodcastWithEpisodes(name: PodcastName, limit?: number) {
	return useQuery(api.podcasts.getPodcastWithEpisodes, { name, limit });
}

// Hook to get latest episode (real-time streaming)
export function useLatestEpisode(podcastName: PodcastName) {
	return useQuery(api.podcasts.getLatestEpisode, { podcastName });
}
