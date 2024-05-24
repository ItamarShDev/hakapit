import { desc, eq, max } from "drizzle-orm";
import { updateFeedInDb, type PodcastName } from "~/api/load/route";
import { db } from "~/db/config";
import { episodes, podcasts } from "~/db/schema";
export { type PodcastName } from "~/api/load/route";

export async function fetchLatestEpisode(podcast: PodcastName) {
	await updateFeedInDb(podcast);
	const episodesId = await db
		.select({ value: max(episodes.episodeNumber) })
		.from(episodes)
		.leftJoin(podcasts, eq(episodes.podcast, podcasts.name))
		.where(eq(podcasts.name, podcast));
	if (episodesId[0].value)
		return await db.query.episodes.findFirst({
			where: eq(episodes.episodeNumber, episodesId[0].value),
			with: { podcast: true },
		});
}

export async function fetchEpisode(episodeID: string) {
	return db.query.episodes.findFirst({
		where: eq(episodes.episodeNumber, Number.parseInt(episodeID)),
		with: { podcast: true },
	});
}

export async function fetchFeed(podcast: PodcastName, number = 5) {
	await updateFeedInDb(podcast);
	const limit = number > 0 ? { limit: number } : {};
	return db.query.podcasts.findFirst({
		where: eq(podcasts.name, podcast),
		with: { episodes: { ...limit, orderBy: [desc(episodes.episodeNumber)], with: { podcast: true } } },
	});
}
