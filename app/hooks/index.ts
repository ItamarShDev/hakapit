import { useLoaderData } from "@remix-run/react";
import { useEventSource } from "remix-utils/sse/react";
import { Jsonify } from "type-fest";
import { fetchFeed, fetchLatestEpisode } from "~/api/rss/feed";

export function toDateString(value?: string | null) {
	return value && new Date(Date.parse(value)).toLocaleDateString();
}

export function toDate(value?: string) {
	return value ? new Date(Date.parse(value)) : null;
}
type Options = {
	latest?: boolean;
	limit?: number;
};
type Latest = { latest: true };
export type FeedData = Jsonify<Awaited<ReturnType<typeof fetchFeed>>>;
export type EpisodeData = Jsonify<Awaited<ReturnType<typeof fetchLatestEpisode>>>;
export type Metadata<T> = T extends Latest
	? {
			limit?: number;
			metadata: EpisodeData;
			podcast: "hakapit" | "balcony-albums" | "nitk";
	  }
	: {
			limit?: number;
			metadata: FeedData;
			podcast: "hakapit" | "balcony-albums" | "nitk";
	  };

export function usePodcastData<T extends Options>({ latest = false, limit = 0 }: Options = {}): Metadata<T> {
	const { podcast, metadata } = useLoaderData<Metadata<T>>();
	const feed = useEventSource(`/api/feed?podcast=${podcast}&latest=${latest}&limit=${limit}`, { event: "sync" });
	const feedData: typeof metadata = feed ? JSON.parse(feed) : metadata;
	return { metadata: feedData, podcast } as Metadata<T>;
}
