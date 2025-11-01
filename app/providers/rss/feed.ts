"use server";
import { desc, eq, ilike, like } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "~/db/config";
import { episodes, podcasts, toSchemaEpisode, toSchemaPodcast } from "~/db/schema";
import { fetch_rss } from "~/providers/rss/fetch-rss";
import type { Feed } from "~/providers/rss/types";
import { sliceFeedItems } from "./feed.utils";

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
	return sliceFeedItems(rss as Feed, number);
}
async function getCachedUpdateFeedInDb(feedName: PodcastName) {
	"use cache";
	cacheLife({ revalidate: 3600 }); // 1 hour for RSS updates
	cacheTag(`rss-${feedName}`);
	return await updateFeedInDb(feedName);
}

async function getCachedFetchFeed(podcast: PodcastName, number = 5) {
	"use cache";
	cacheLife({ revalidate: 6000 }); // 100 minutes to match original revalidate
	cacheTag(`rss-${podcast}`);
	const limit = number > 0 ? { limit: number } : {};
	return await db.query.podcasts.findFirst({
		where: eq(podcasts.name, podcast),
		with: { episodes: { ...limit, orderBy: [desc(episodes.episodeNumber)], with: { podcast: true } } },
	});
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
	return await getCachedFetchFeed(podcast, number);
}
export async function fetchUpdatedFeed(podcast: PodcastName, number = 5) {
	const isDev = process.env.NODE_ENV === "development";
	// Check if podcast data was updated recently to avoid excessive RSS fetches
	const podcastData = await db.query.podcasts.findFirst({
		where: eq(podcasts.name, podcast),
	});
	const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

	if (podcastData?.updatedAt && podcastData.updatedAt > oneHourAgo) {
		// Data is fresh, return directly
		return await fetchFeed(podcast, number);
	}

	// For serverless environments, we need to update synchronously but efficiently
	// Consider implementing a cron job for better performance
	await getCachedUpdateFeedInDb(podcast);
	const result = await fetchFeed(podcast, number);
	if (isDev) console.timeEnd(`rss-update-${podcast}`);
	return result;
}
