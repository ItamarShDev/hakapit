export function toDateString(value?: Date | null) {
  if (!value) return undefined;
  return new Date(value).toLocaleDateString();
}

export function toDate(value?: string) {
  if (!value) return null;
  const date = new Date(Date.parse(value));
  return isNaN(date.getTime()) ? null : date;
}

export interface Episode {
  _id?: unknown;
  episodeNumber: number;
  guid?: string;
  title: string;
  link?: string;
  description?: string | null;
  htmlDescription?: string | null;
  imageUrl?: string | null;
  audioUrl: string;
  publishedAt?: number | Date | null;
  duration?: string | null;
  createdAt?: number | Date;
  updatedAt?: number | Date;
  podcast?: { name: string } | null;
}

export interface PodcastWithEpisodes {
  _id?: unknown;
  name?: string;
  title?: string;
  link?: string;
  description?: string | null;
  imageUrl?: string | null;
  feedUrl?: string;
  authorName?: string | null;
  authorEmail?: string | null;
  authorSummary?: string | null;
  authorImageUrl?: string | null;
  episodes: Episode[];
  totalEpisodes?: number;
}

export type FeedData = PodcastWithEpisodes | null;
export type EpisodeData = Episode | null;
export type EpisodeWithPodcast = Episode;
