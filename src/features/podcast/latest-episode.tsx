import { LastEpisodeCardPreview } from "~/features/podcast/episode-card";
import { useLatestEpisode } from "~/features/podcast/use-podcasts";

import type { Episode } from "~/features/podcast/types";
import type { PodcastName } from "~/server/rss/feed";

export function LatestEpisode({ podcast, initialEpisode }: { podcast: PodcastName; initialEpisode?: Episode | null }) {
  const liveEpisode = useLatestEpisode(podcast);
  const episode = liveEpisode ?? initialEpisode;

  if (episode === undefined) {
    return <div className="size-22 text-center vertical-align-middle text-slate-700 italic">טוען פרק</div>;
  }

  if (!episode) {
    return null;
  }

  return <LastEpisodeCardPreview episode={{ ...episode, podcast: { name: podcast } }} />;
}
