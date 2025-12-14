import type { Doc } from "convex/_generated/dataModel";
import { type PodcastName, updateFeedsInDb } from "~/app/providers/rss/feed";

export async function getLatestEpisode() {
	const results = await updateFeedsInDb();
	const newEpisodes = results.filter((result) => result?.latestEpisode);
	if (newEpisodes.length === 0) {
		return null;
	}
	const episodePerPodcast: { [key in PodcastName]?: Doc<"episodes"> } = {};
	for (const result of newEpisodes) {
		if (!result || !result.latestEpisode || !result.podcast) {
			continue;
		}
		episodePerPodcast[result.podcast] = result.latestEpisode;
	}
	return episodePerPodcast;
}
