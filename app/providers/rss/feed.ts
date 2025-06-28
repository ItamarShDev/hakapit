"use server";
import { desc, eq, ilike, like } from "drizzle-orm";
import { db } from "~/db/config";
import { episodes, podcasts, toSchemaEpisode, toSchemaPodcast } from "~/db/schema";
import { fetch_rss } from "~/providers/rss/fetch-rss";
import type { Feed } from "~/providers/rss/types";

const PODCAST_URLS = {
	hakapit: process.env.HAKAPIT_RSS,
	nitk: process.env.NITK_RSS,
	"balcony-albums": process.env.BALCONY_RSS,
};

const PODCAST_NAMES = Object.keys(PODCAST_URLS) as PodcastName[];
export type PodcastName = keyof typeof PODCAST_URLS;

function _fetch(podcast: PodcastName) {
	const url = PODCAST_URLS[podcast];
	return fetch_rss(url);
}

async function fetchRSSFeed(podcast: PodcastName, number = 5): Promise<Feed> {
	const rss = await _fetch(podcast);
	if (number > 0) {
		const episodes = rss.items.slice(0, number);
		rss.items = episodes;
	}
	return rss as Feed;
}
async function updateFeedInDb(feedName: PodcastName) {
	const feed = await fetchRSSFeed(feedName, 0);

	const podcastsDB = await db.query.podcasts.findFirst({
		where: ilike(podcasts.name, feedName),
		with: {
			episodes: true,
		},
	});

	let newEpisodes = feed.items;
	if (!podcastsDB) {
		await db.insert(podcasts).values(toSchemaPodcast(feed, feedName)).execute();
	} else {
		await db
			.update(podcasts)
			.set(toSchemaPodcast(feed, feedName))
			.where(like(podcasts.name, feedName as string))
			.execute();
		newEpisodes = feed.items.filter((episode) => episode.number > podcastsDB.episodes[0].episodeNumber);
	}
	if (newEpisodes.length === 0) {
		return;
	}

	const insertResult = await db
		.insert(episodes)
		.values(newEpisodes.map((ep) => toSchemaEpisode(ep, feedName)))
		.onConflictDoNothing()
		.execute();

	const latestEpisode = await getLastEpisode(feedName);
	return { podcast: feedName, insertResult, latestEpisode };
}

export async function updateFeedsInDb() {
	return await Promise.all(PODCAST_NAMES.map((key) => updateFeedInDb(key as PodcastName)));
}
function getLastEpisode(podcast: PodcastName) {
	return db.query.episodes.findFirst({
		where: eq(episodes.podcast, podcast),
		orderBy: [desc(episodes.episodeNumber)],
		with: { podcast: true },
	});
}

export async function fetchLatestEpisode(podcast: PodcastName) {
	await updateFeedInDb(podcast);
	return await getLastEpisode(podcast);
}

export async function fetchEpisode(episodeID: string) {
	return db.query.episodes.findFirst({
		where: eq(episodes.episodeNumber, Number.parseInt(episodeID)),
		with: { podcast: true },
	});
}

export async function fetchFeed(podcast: PodcastName, number = 5) {
	const limit = number > 0 ? { limit: number } : {};
	return await db.query.podcasts.findFirst({
		where: eq(podcasts.name, podcast),
		with: { episodes: { ...limit, orderBy: [desc(episodes.episodeNumber)], with: { podcast: true } } },
	});
}
export async function fetchUpdatedFeed(podcast: PodcastName, number = 5) {
	await updateFeedInDb(podcast);
	return await fetchFeed(podcast, number);
}
