import type { fetchFeed, fetchLatestEpisode } from "~/app/providers/rss/feed";

export function toDateString(value?: Date | null) {
  if (!value) return undefined;
  return new Date(value).toLocaleDateString();
}

export function toDate(value?: string) {
  if (!value) return null;
  const date = new Date(Date.parse(value));
  return isNaN(date.getTime()) ? null : date;
}

type Latest = { latest: true };
export type FeedData = Awaited<ReturnType<typeof fetchFeed>>;
export type EpisodeData = Awaited<ReturnType<typeof fetchLatestEpisode>>;

export type EpisodeWithPodcast = EpisodeData & {
  podcast?: {
    name: string;
  };
};
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
