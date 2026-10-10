import type { Doc } from "convex/_generated/dataModel";
import type { PodcastName } from "~/features/podcast/podcasts";
import type { Episode, PodcastWithEpisodes } from "~/features/podcast/types";
import type { SoccerSnapshot } from "~/server/soccer-api";
export type PageData = { path: string; podcast: PodcastName; title: string; description: string; image: string } & (
  | {
      kind: "home";
      snapshot: SoccerSnapshot | null;
      transfers: Doc<"transfers">[] | null;
      latestEpisode: Episode | null;
    }
  | { kind: "feed"; feed: PodcastWithEpisodes | null }
  | { kind: "episode"; episode: Episode | null }
  | { kind: "error"; message: string }
);
