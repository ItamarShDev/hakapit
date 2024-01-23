import { fetch_rss } from "~/api/rss/fetch-rss";
import type { EpisodeData, Feed } from "~/api/rss/types";

const PODCAST_URLS = {
	hakapit: process.env.HAKAPIT_RSS,
	nitk: process.env.NITK_RSS,
	"balcony-albums": process.env.BALCONY_RSS,
};

export type PodcastName = keyof typeof PODCAST_URLS;

function _fetch(podcast: PodcastName) {
	const url = PODCAST_URLS[podcast];
	return fetch_rss(url);
}
export async function fetchLatestEpisode(podcast: PodcastName): Promise<EpisodeData | undefined> {
	const { items } = await _fetch(podcast);
	const episode = items.at(0);
	return episode;
}

export async function fetchEpisode(podcast: PodcastName, episodeID: string): Promise<EpisodeData | undefined> {
	const { items } = await _fetch(podcast);
	const episodeNumber = parseInt(episodeID);
	if (episodeNumber) {
		const episode = items.find((episode) => episode?.number === episodeNumber);
		return episode;
	}
	return items.find((episode) => episode?.guid?.split("/").pop() === episodeID);
}

export async function fetchFeed(podcast: PodcastName, number = 5): Promise<Feed> {
	const rss = await _fetch(podcast);
	if (number > 0) {
		const episodes = rss.items.slice(0, number);
		rss.items = episodes;
	}
	return rss as Feed;
}
