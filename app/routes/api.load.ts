import { ilike, like } from "drizzle-orm";
import { PODCAST_NAMES, fetchRSSFeed, type PodcastName } from "~/api/rss/feed";
import { db } from "~/db/config";
import { episodes, podcasts, toSchemaEpisode, toSchemaPodcast } from "~/db/schema";

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

export function updateFeedsInDb() {
	return Promise.all(PODCAST_NAMES.map((key) => updateFeedInDb(key as PodcastName)));
}

export const loader = async () => {
	const insertResult = await updateFeedsInDb();
	if (insertResult) {
		return {
			status: 200,
			headers: {
				"Content-Type": "text/plain",
			},
			body: "Feed updated",
		};
	}
	return {
		status: 304,
		headers: {
			"Content-Type": "text/plain",
		},
		body: "Feed not updated",
	};
};
