import { ConvexHttpClient } from "convex/browser";
import { fetch_rss } from "~/app/providers/rss/fetch-rss";
import type { Feed } from "~/app/providers/rss/types";
import { api } from "../../../../convex/_generated/api";
import { sliceFeedItems } from "./feed.utils";

const convexUrl = process.env.CONVEX_URL || import.meta.env.VITE_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

const PODCAST_URLS = {
	hakapit: process.env.HAKAPIT_RSS,
	nitk: process.env.NITK_RSS,
	"balcony-albums": process.env.BALCONY_RSS,
};

const PODCAST_NAMES = Object.keys(PODCAST_URLS) as PodcastName[];
export type PodcastName = keyof typeof PODCAST_URLS;

function isPodcastName(value: string): value is PodcastName {
	return (PODCAST_NAMES as string[]).includes(value);
}

// Remove iframes from HTML content (defensive approach for feed responses)
function removeIframes(content: string): string {
	if (!content) return content;

	// Remove iframe tags and their content
	return content.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "");
}

function _fetch(podcast: PodcastName) {
	const url = PODCAST_URLS[podcast];
	return fetch_rss(url);
}

async function fetchRSSFeed(podcast: PodcastName, number = 5): Promise<Feed> {
	const rss = await _fetch(podcast);
	return sliceFeedItems(rss as Feed, number);
}

// Get podcast with episodes from Convex
export async function fetchFeed(podcast: PodcastName, number = 5) {
	if (!convex) return null;
	const result = await convex.query(api.podcasts.getPodcastWithEpisodes, {
		name: podcast,
		limit: number > 0 ? number : undefined,
	});

	// Clean iframes from episode content before returning to UI
	if (result?.episodes) {
		result.episodes = result.episodes.map((episode) => ({
			...episode,
			description: removeIframes(episode.description || ""),
			htmlDescription: removeIframes(episode.htmlDescription || ""),
		}));
	}

	return result;
}

// Get latest episode from Convex
export async function fetchLatestEpisode(podcast: PodcastName) {
	if (!convex) return null;
	const result = await convex.query(api.podcasts.getLatestEpisode, {
		podcastName: podcast,
	});

	return result;
}

// Get latest episode with caching logic
export async function fetchUpdatedLatestEpisode(podcast: PodcastName) {
	if (!convex) return null;

	const cacheKey = `podcast-rss-${podcast}`;
	const cacheStatus = await convex.query(api.cache.isCacheExpired, {
		dataType: cacheKey,
	});

	if (!cacheStatus.expired) {
		// Cache is fresh, return directly from database
		return await fetchLatestEpisode(podcast);
	}

	// Cache expired or doesn't exist - fetch from RSS and update database
	await updateFeedInDb(podcast);

	// Update cache tracking with 1 hour expiration
	const oneHourFromNow = Date.now() + 60 * 60 * 1000;
	await convex.mutation(api.cache.updateCacheTracking, {
		dataType: cacheKey,
		source: "rss",
		expiresAt: oneHourFromNow,
	});

	return await fetchLatestEpisode(podcast);
}

export async function fetchEpisode({ podcastName, episodeNumber }: { podcastName: string; episodeNumber: number }) {
	if (!convex) {
		return null;
	}
	return await convex.query(api.podcasts.getEpisodeByNumber, {
		podcastName,
		episodeNumber,
	});
}

// Update feed in Convex (migration from PostgreSQL)
async function updateFeedInDb(feedName: PodcastName) {
	if (!convex) return;

	const feed = await fetchRSSFeed(feedName, 0);
	if (!feed?.title) {
		return;
	}

	// Check if podcast exists
	const existingPodcast = await convex.query(api.podcasts.getPodcastByName, {
		name: feedName,
	});

	// Create or update podcast
	await convex.mutation(api.podcasts.upsertPodcast, {
		name: feedName,
		title: feed.title,
		link: feed.link,
		feedUrl: feed.feedUrl,
		description: feed.description,
		imageUrl: feed.itunes?.image,
		authorName: feed.itunes?.owner?.name,
		authorEmail: feed.itunes?.owner?.email,
		authorSummary: feed.itunes?.summary,
		authorImageUrl: feed.itunes?.image,
	});

	// Get existing episodes to determine new ones
	const existingEpisodes = await convex.query(api.podcasts.getPodcastWithEpisodes, {
		name: feedName,
	});

	let newEpisodes = feed.items;
	if (existingPodcast && existingEpisodes?.episodes?.length && existingEpisodes.episodes.length > 0) {
		const latestEpisodeNumber = Math.max(...existingEpisodes.episodes.map((e) => e.episodeNumber));
		newEpisodes = feed.items.filter((episode) => episode.number > latestEpisodeNumber);
	}

	// Insert new episodes
	for (const episode of newEpisodes) {
		await convex.mutation(api.podcasts.createEpisode, {
			podcastName: feedName,
			episodeNumber: episode.number,
			guid: episode.episodeGUID,
			title: episode.title,
			link: episode.link,
			description: episode.contentSnippet,
			htmlDescription: episode.content,
			imageUrl: episode.itunes.image,
			audioUrl: episode.enclosure?.url || "",
			publishedAt: episode.isoDate ? new Date(episode.isoDate).getTime() : undefined,
			duration: episode.itunes.duration,
		});
	}

	const latestEpisode = await convex.query(api.podcasts.getLatestEpisode, {
		podcastName: feedName,
	});

	return { podcast: feedName, latestEpisode };
}

// Update all feeds
export async function updateFeedsInDb() {
	return await Promise.all(PODCAST_NAMES.filter((key) => isPodcastName(key)).map((key) => updateFeedInDb(key)));
}

// Get updated feed with caching logic
export async function fetchUpdatedFeed(podcast: PodcastName, number = 5) {
	if (!convex) return null;

	const cacheKey = `podcast-rss-${podcast}`;
	const cacheStatus = await convex.query(api.cache.isCacheExpired, {
		dataType: cacheKey,
	});

	if (!cacheStatus.expired) {
		// Cache is fresh, return directly from database
		const result = await fetchFeed(podcast, number);
		// Clean iframes from episode content in the result
		if (result?.episodes) {
			result.episodes = result.episodes.map((episode) => ({
				...episode,
				description: removeIframes(episode.description || ""),
				htmlDescription: removeIframes(episode.htmlDescription || ""),
			}));
		}
		return result;
	}

	// Cache expired or doesn't exist - fetch from RSS and update database
	await updateFeedInDb(podcast);

	// Update cache tracking with 1 hour expiration
	const oneHourFromNow = Date.now() + 60 * 60 * 1000;
	await convex.mutation(api.cache.updateCacheTracking, {
		dataType: cacheKey,
		source: "rss",
		expiresAt: oneHourFromNow,
	});

	const result = await fetchFeed(podcast, number);

	// Ensure episodes are sorted from highest to lowest episode number
	if (result?.episodes) {
		result.episodes.sort((a, b) => b.episodeNumber - a.episodeNumber);
		// Clean iframes from episode content in the result
		result.episodes = result.episodes.map((episode) => ({
			...episode,
			description: removeIframes(episode.description || ""),
			htmlDescription: removeIframes(episode.htmlDescription || ""),
		}));
	}

	return result;
}
