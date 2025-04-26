import { updateFeedsInDb } from "~/server/rss/feed";

export const revalidate = 6000;
export async function GET() {
	const results = await updateFeedsInDb();
	const newEpisodes = results.filter((result) => result?.latestEpisode);
	const episodes = results.map((result) => result && [result.podcast, result.latestEpisode]);
	const episodePerPodcast = Object.fromEntries(episodes.filter(Array.isArray));

	if (newEpisodes.length > 0) {
		return new Response(JSON.stringify(episodePerPodcast), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
	return new Response(JSON.stringify([]), {
		status: 304,
		headers: {
			"Content-Type": "application/json",
		},
	});
}
