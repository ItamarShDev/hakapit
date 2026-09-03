import type { PodcastName } from "~/server/rss/feed";

export function validatePodcastParam(podcast: string): podcast is PodcastName {
  const validPodcasts = ["hakapit", "nitk", "balcony-albums"];
  return validPodcasts.includes(podcast);
}
