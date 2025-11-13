"use server";
import { ConvexHttpClient } from "convex/browser";
import { cacheTag } from "next/cache";
import { api } from "~/convex/_generated/api";
import { fetch_rss } from "~/providers/rss/fetch-rss";
import type { Feed } from "~/providers/rss/types";
import { sliceFeedItems } from "./feed.utils";

// Initialize Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
	throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is required");
}
const convex = new ConvexHttpClient(convexUrl);

const PODCAST_URLS = {
	hakapit: process.env.HAKAPIT_RSS,
	nitk: process.env.NITK_RSS,
	"balcony-albums": process.env.BALCONY_RSS,
};

const PODCAST_NAMES = Object.keys(PODCAST_URLS) as PodcastName[];
export type PodcastName = keyof typeof PODCAST_URLS;

function _fetch(podcast: PodcastName) {
	const url = PODCAST_URLS[podcast];
	if (!url) {
		throw new Error(`No RSS URL found for podcast: ${podcast}`);
	}
	return fetch_rss(url);
}

async function fetchRSSFeed(podcast: PodcastName, number = 10): Promise<Feed> {
	const rss = await _fetch(podcast);
	return sliceFeedItems(rss as Feed, number);
}

async function updateFeedInDb(feedName: PodcastName) {
	const feed = await fetchRSSFeed(feedName, 0);

	const podcastsDB = await convex.query(api.podcasts.getPodcastWithEpisodes, {
		name: feedName,
	});

	// Create or update podcast
	await convex.mutation(api.podcasts.upsertPodcast, {
		name: feedName,
		title: feed.title,
		link: feed.link,
		description: feed.description,
		imageUrl: feed.itunes?.image,
		feedUrl: feed.feedUrl,
		authorName: feed.itunes?.owner?.name,
		authorEmail: feed.itunes?.owner?.email,
		authorSummary: feed.itunes?.summary,
		authorImageUrl: feed.itunes?.image,
	});

	let newEpisodes = feed.items;
	if (podcastsDB?.episodes && podcastsDB.episodes.length > 0) {
		const latestEpisodeNumber = Math.max(...podcastsDB.episodes.map((ep) => ep.episodeNumber));
		newEpisodes = feed.items.filter((episode) => (episode.number || 0) > latestEpisodeNumber);
	}

	if (newEpisodes.length === 0) {
		return;
	}

	// Insert new episodes
	for (const episode of newEpisodes) {
		await convex.mutation(api.podcasts.createEpisode, {
			podcastName: feedName,
			episodeNumber: episode.number || 0,
			guid: episode.episodeGUID,
			title: episode.title,
			link: episode.link,
			description: episode.contentSnippet,
			htmlDescription: episode.content,
			imageUrl: episode.itunes?.image,
			audioUrl: episode.enclosure?.url || "",
			publishedAt: episode.isoDate ? new Date(episode.isoDate).getTime() : undefined,
			duration: episode.itunes?.duration,
		});
	}

	const latestEpisode = await getLastEpisode(feedName);
	return { podcast: feedName, insertResult: { count: newEpisodes.length }, latestEpisode };
}

export async function updateFeedsInDb() {
	return await Promise.all(PODCAST_NAMES.map((key) => updateFeedInDb(key as PodcastName)));
}

function getLastEpisode(podcast: PodcastName) {
	return convex.query(api.podcasts.getLatestEpisode, { podcastName: podcast });
}

export async function getEpisode(podcast: PodcastName, episodeID: string) {
	cacheTag(`episode-${podcast}-${episodeID}`);
	const episodeNumber = Number.parseInt(episodeID);
	return await convex.query(api.podcasts.getEpisodeByNumber, {
		podcastName: podcast,
		episodeNumber,
	});
}

export async function getFeed(podcast: PodcastName) {
	cacheTag(`feed-${podcast}`);
	const feed = await fetchRSSFeed(podcast);
	const podcastData = await convex.query(api.podcasts.getPodcastByName, { name: podcast });

	return { feed, podcastData };
}

export async function getAllFeeds() {
	cacheTag("all-feeds");
	const allPodcasts = await convex.query(api.podcasts.getAllPodcasts);
	return allPodcasts;
}

export async function fetchUpdatedFeed(podcast: PodcastName, number = 5) {
	const isDev = process.env.NODE_ENV === "development";
	// Check if podcast data was updated recently to avoid excessive RSS fetches
	const podcastData = await convex.query(api.podcasts.getPodcastWithEpisodes, {
		name: podcast,
	});
	const oneHourAgo = Date.now() - 60 * 60 * 1000;

	if (podcastData?.updatedAt && podcastData.updatedAt > oneHourAgo) {
		// Data is fresh, return directly
		return await fetchRSSFeed(podcast, number);
	}

	// For serverless environments, we need to update synchronously but efficiently
	// Consider implementing a cron job for better performance
	await updateFeedInDb(podcast);
	const result = await fetchRSSFeed(podcast, number);
	if (isDev) console.timeEnd(`rss-update-${podcast}`);
	return result;
}
