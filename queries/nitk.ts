import { QueryClient, useQuery } from "@tanstack/react-query";
import { EpisodeData, fetchEpisode, fetchFeed } from "pages/api/nitk/feed";
const path = ["nitk", "feed"];
export function getPagePath(page: number) {
  return [...path, page];
}
export async function prefetchFeed() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(getPagePath(1), () => fetchFeed(1));
  return queryClient;
}

export function useFeedByPage(page: number) {
  return useQuery(getPagePath(page), () => fetchFeed(page));
}
export function useEpisode(episodeSlug: string) {
  return useQuery<EpisodeData>([...path, "episode", episodeSlug], () =>
    fetchEpisode(episodeSlug)
  );
}
