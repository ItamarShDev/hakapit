import { desc, eq, max } from "drizzle-orm";
import { fetch_rss } from "~/api/rss/fetch-rss";
import type { Feed } from "~/api/rss/types";
import { db } from "~/db/config.server";
import { episodes, podcasts } from "~/db/schema.server";
import { updateFeedInDb } from "~/routes/api.load.server";

const PODCAST_URLS = {
	hakapit: process.env.HAKAPIT_RSS,
	nitk: process.env.NITK_RSS,
	"balcony-albums": process.env.BALCONY_RSS,
};

export const PODCAST_NAMES = Object.keys(PODCAST_URLS) as PodcastName[];
export type PodcastName = keyof typeof PODCAST_URLS;

function _fetch(podcast: PodcastName) {
	const url = PODCAST_URLS[podcast];
	return fetch_rss(url);
}

export async function fetchRSSFeed(podcast: PodcastName, number = 5): Promise<Feed> {
	const rss = await _fetch(podcast);
	if (number > 0) {
		const episodes = rss.items.slice(0, number);
		rss.items = episodes;
	}
	return rss as Feed;
}

export async function fetchLatestEpisode(podcast: PodcastName) {
	await updateFeedInDb(podcast);
	const episodesId = await db
		.select({ value: max(episodes.episodeNumber) })
		.from(episodes)
		.leftJoin(podcasts, eq(episodes.podcast, podcasts.name))
		.where(eq(podcasts.name, podcast));
	if (episodesId[0].value)
		return await db.query.episodes.findFirst({
			where: eq(episodes.episodeNumber, episodesId[0].value),
			with: { podcast: true },
		});
}

export function fetchEpisode(episodeID: string) {
	return db.query.episodes.findFirst({
		where: eq(episodes.episodeNumber, Number.parseInt(episodeID)),
		with: { podcast: true },
	});
}

export function fetchFeed(podcast: PodcastName, number = 5) {
	const limit = number > 0 ? { limit: number } : {};
	return db.query.podcasts.findFirst({
		where: eq(podcasts.name, podcast),
		with: { episodes: { ...limit, orderBy: [desc(episodes.episodeNumber)], with: { podcast: true } } },
	});
}
