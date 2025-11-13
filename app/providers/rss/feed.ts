"use server";
import { ConvexHttpClient } from "convex/browser";
import { cacheTag } from "next/cache";
import { fetch_rss } from "~/providers/rss/fetch-rss";
import type { Feed } from "~/providers/rss/types";
import { api } from "../../../convex/_generated/api";
import { sliceFeedItems } from "./feed.utils";

const PODCAST_URLS = {
	hakapit: process.env.HAKAPIT_RSS,
	nitk: process.env.NITK_RSS,
	"balcony-albums": process.env.BALCONY_RSS,
};

const PODCAST_NAMES = Object.keys(PODCAST_URLS) as PodcastName[];
export type PodcastName = keyof typeof PODCAST_URLS;

// Initialize Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
	throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is required");
}
const convex = new ConvexHttpClient(convexUrl);

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
	// Temporarily removed "use cache" to ensure iframe removal takes effect
	// cacheTag(`rss-${podcast}-${number}`);

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
	"use cache";
	cacheTag(`rss-${podcast}-latest`);

	const result = await convex.query(api.podcasts.getLatestEpisode, {
		podcastName: podcast,
	});

	return result;
}

// Get episode by number from Convex
export async function fetchEpisode(episodeID: string) {
	"use cache";
	cacheTag(`episode-${episodeID}`);

	// Parse episodeID to extract podcast name and episode number
	// This assumes episodeID format: "podcastName-episodeNumber"
	const [podcastName, episodeNumberStr] = episodeID.split("-");
	const episodeNumber = Number.parseInt(episodeNumberStr);

	if (!podcastName || Number.isNaN(episodeNumber)) {
		return null;
	}

	return await convex.query(api.podcasts.getEpisodeByNumber, {
		podcastName,
		episodeNumber,
	});
}

// Update feed in Convex (migration from PostgreSQL)
async function updateFeedInDb(feedName: PodcastName) {
	const feed = await fetchRSSFeed(feedName, 0);

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
	const existingEpisodes = await convex.query(
		api.podcasts.getPodcastWithEpisodes,
		{
			name: feedName,
		},
	);

	let newEpisodes = feed.items;
	if (
		existingPodcast &&
		existingEpisodes?.episodes?.length &&
		existingEpisodes.episodes.length > 0
	) {
		const latestEpisodeNumber = Math.max(
			...existingEpisodes.episodes.map((e) => e.episodeNumber),
		);
		newEpisodes = feed.items.filter(
			(episode) => episode.number > latestEpisodeNumber,
		);
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
			publishedAt: episode.isoDate
				? new Date(episode.isoDate).getTime()
				: undefined,
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
	return await Promise.all(
		PODCAST_NAMES.map((key) => updateFeedInDb(key as PodcastName)),
	);
}

// Get updated feed with caching logic
export async function fetchUpdatedFeed(podcast: PodcastName, number = 5) {
	const isDev = process.env.NODE_ENV === "development";

	// Check if podcast data was updated recently
	const updateStatus = await convex.query(api.podcasts.getPodcastUpdateStatus, {
		name: podcast,
	});

	if (updateStatus?.wasUpdatedRecently) {
		// Data is fresh, return directly
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

	// Update the feed
	await updateFeedInDb(podcast);
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

	if (isDev) console.timeEnd(`rss-update-${podcast}`);
	return result;
}
