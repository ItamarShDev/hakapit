import { LastEpisodeCardPreview } from "~/app/components/EpisodeCard";
import { useLatestEpisode, usePodcastWithEpisodes } from "~/app/hooks/usePodcasts";

import type { Episode } from "~/app/utils";

type EpisodeDoc = Episode | null | undefined;

export function LatestEpisode({ initialEpisode }: { initialEpisode?: EpisodeDoc }) {
  const liveEpisode = useLatestEpisode("hakapit");
  const episode = liveEpisode ?? initialEpisode;
  const podcastData = usePodcastWithEpisodes("hakapit", 1);

  if (episode === undefined && !initialEpisode) {
    return <div className="size-22 text-center vertical-align-middle text-slate-700 italic">טוען פרק</div>;
  }

  if (!episode) {
    return null;
  }

  const podcastName = podcastData?.name ?? "hakapit";

  const episodeData = {
    ...episode,
    id: episode.episodeNumber ?? episode._id,
    podcast: { name: podcastName },
    createdAt: new Date(episode.createdAt as number),
    updatedAt: new Date(episode.updatedAt as number),
    duration: episode.duration || null,
    link: episode.link || null,
    description: episode.description || null,
    htmlDescription: episode.htmlDescription || null,
    imageUrl: episode.imageUrl || null,
    publishedAt: episode.publishedAt ? new Date(episode.publishedAt) : null,
    guid: episode.guid || null,
  };

  return <LastEpisodeCardPreview episode={episodeData as Episode} />;
}
