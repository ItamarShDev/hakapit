import { getLatestEpisode } from "~/providers/rss/get-latest-episode";

export async function GET() {
	const episodePerPodcast = await getLatestEpisode();
	if (episodePerPodcast) {
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
