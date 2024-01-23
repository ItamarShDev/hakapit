import { eq } from "drizzle-orm";
import { PODCAST_NAMES, PodcastName, fetchFeed } from "~/api/rss/feed";
import { db } from "~/db/config.server";
import { episodes, podcasts, toSchemaEpisode } from "~/db/schema.server";
import { toDate } from "~/hooks";

async function updateFeedInDb(feedName: PodcastName) {
	const feed = await fetchFeed(feedName, 0);
	const lastEpisodeDate = toDate(feed.items.at(0)?.isoDate);
	const lastUpdatedSelect = await db
		.select()
		.from(podcasts)
		.where(eq(podcasts.title, feedName as string));
	const lastUpdated = lastUpdatedSelect[0]?.updatedAt;
	if (!lastUpdated || !lastEpisodeDate) {
		console.log("No last updated date or last episode date");
		return;
	}
	if (lastEpisodeDate.getTime() <= lastUpdated.getTime()) {
		console.log("No new episodes");
		return;
	}
	const newEpisodes = feed.items.filter((episode) => {
		const episodeDate = toDate(episode.isoDate);
		return episodeDate && episodeDate.getTime() > lastUpdated.getTime();
	});
	if (newEpisodes.length === 0) {
		console.log("No new episodes");
		return;
	}
	console.log(`${newEpisodes.length} new episodes found`);

	const insertResult = await db
		.insert(episodes)
		.values(newEpisodes.map((ep) => toSchemaEpisode(ep)))
		.execute();
	console.log(`Inserted ${insertResult.rowCount} new episodes`);

	return insertResult;
}

function updateFeedsInDb() {
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
