import type { PodcastName } from "~/app/providers/rss/feed";

export function validatePodcastParam(podcast: string): podcast is PodcastName {
	const validPodcasts = ["hakapit", "nitk", "balcony-albums"];
	return validPodcasts.includes(podcast);
}
