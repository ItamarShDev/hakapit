import { ilike, like } from "drizzle-orm";
import { PODCAST_NAMES, PodcastName, fetchRSSFeed } from "~/api/rss/feed";
import { db } from "~/db/config.server";
import { episodes, podcasts, toSchemaEpisode, toSchemaPodcast } from "~/db/schema.server";
import { toDate } from "~/hooks";

export async function updateFeedInDb(feedName: PodcastName) {
	const feed = await fetchRSSFeed(feedName, 0);
	const podcastsDB = await db.query.podcasts.findFirst({
		where: ilike(podcasts.name, feedName),
	});

	let newEpisodes = feed.items;
	if (!podcastsDB) {
		await db.insert(podcasts).values(toSchemaPodcast(feed, feedName)).execute();
	} else {
		const lastUpdated = podcastsDB?.updatedAt;
		await db
			.update(podcasts)
			.set(toSchemaPodcast(feed, feedName))
			.where(like(podcasts.name, feedName as string))
			.execute();
		newEpisodes = feed.items.filter((episode) => {
			const episodeDate = toDate(episode.isoDate);
			return episodeDate && episodeDate.getTime() > lastUpdated.getTime();
		});
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
