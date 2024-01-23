import type { LoaderFunctionArgs } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { PodcastName, fetchFeed } from "~/api/rss/feed";
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
		return;
	}
	if (lastEpisodeDate.getTime() <= lastUpdated.getTime()) {
		return;
	}
	const newEpisodes = feed.items.filter((episode) => {
		const episodeDate = toDate(episode.isoDate);
		return episodeDate && episodeDate.getTime() > lastUpdated.getTime();
	});
	if (newEpisodes.length === 0) {
		return;
	}
	const insertResult = await db
		.insert(episodes)
		.values(newEpisodes.map((ep) => toSchemaEpisode(ep)))
		.execute();
	return insertResult;
}
export const loader = async ({ params }: LoaderFunctionArgs) => {
	const feedName = params.podcast as PodcastName;
	const insertResult = await updateFeedInDb(feedName);
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
