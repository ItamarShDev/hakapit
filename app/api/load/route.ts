import { ilike, like } from "drizzle-orm";
import { db } from "~/db/config";
import { episodes, podcasts, toSchemaEpisode, toSchemaPodcast } from "~/db/schema";
import { fetch_rss } from "~/server/rss/fetch-rss";
import type { Feed } from "~/server/rss/types";

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

async function fetchRSSFeed(podcast: PodcastName, number = 5): Promise<Feed> {
	const rss = await _fetch(podcast);
	if (number > 0) {
		const episodes = rss.items.slice(0, number);
		rss.items = episodes;
	}
	return rss as Feed;
}
export async function updateFeedInDb(feedName: PodcastName) {
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

	console.info(`${feedName}: Added ${insertResult.rowCount} new episodes`);
	return insertResult;
}

function updateFeedsInDb() {
	return Promise.all(PODCAST_NAMES.map((key) => updateFeedInDb(key as PodcastName)));
}

export const dynamic = "force-dynamic";
export async function GET() {
	const insertResult = await updateFeedsInDb();
	if (insertResult) {
		return new Response("Feed updated", {
			status: 200,
			headers: {
				"Content-Type": "text/plain",
			},
		});
	}
	return new Response("Feed not updated", {
		status: 304,
		headers: {
			"Content-Type": "text/plain",
		},
	});
}
