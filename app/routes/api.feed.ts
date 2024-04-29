import type { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import { updateFeedsInDb } from "~/routes/api.load";
import { fetchFeed, fetchLatestEpisode, type PodcastName } from "~/server/rss/feed";
function getData(params: LoaderFunctionArgs["params"]) {
	if (!params) return;
	const podcast = params?.podcast as PodcastName;
	if (!podcast) return;
	const latest = params?.latest;
	const limit = params?.limit;

	if (latest === "true") {
		return fetchLatestEpisode(podcast);
	}
	const amount = limit ? Number.parseInt(limit) : 0;
	return fetchFeed(podcast, amount);
}

export async function loader({ request }: LoaderFunctionArgs) {
	return eventStream(request.signal, (send, abort) => {
		async function sync() {
			const updateFeeds = await updateFeedsInDb();
			if (!updateFeeds) {
				console.info("no update feeds");
				abort();
				return;
			}
			const url = new URL(request.url);
			const params = Object.fromEntries(url.searchParams);
			const data = await getData(params);
			if (data) {
				send({ event: "sync", data: JSON.stringify(data) });
			} else {
				abort();
			}
		}
		sync();
		return function cleanup() {};
	});
}
