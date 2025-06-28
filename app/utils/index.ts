import type { fetchFeed, fetchLatestEpisode } from "~/providers/rss/feed";

export function toDateString(value?: Date | null) {
	return value && new Date(value).toLocaleDateString();
}

export function toDate(value?: string) {
	return value ? new Date(Date.parse(value)) : null;
}

type Latest = { latest: true };
export type FeedData = Awaited<ReturnType<typeof fetchFeed>>;
export type EpisodeData = Awaited<ReturnType<typeof fetchLatestEpisode>>;
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
