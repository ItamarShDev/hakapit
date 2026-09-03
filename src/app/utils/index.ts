export function toDateString(value?: Date | null) {
  if (!value) return undefined;
  return new Date(value).toLocaleDateString();
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

export type EpisodeWithPodcast = Episode;
