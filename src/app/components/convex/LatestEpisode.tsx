import { LastEpisodeCardPreview } from "~/app/components/EpisodeCard";
import {
  useLatestEpisode,
  usePodcastWithEpisodes,
} from "~/app/hooks/usePodcasts";

export function LatestEpisode() {
  const episode = useLatestEpisode("hakapit");
  const podcastData = usePodcastWithEpisodes("hakapit", 1);

  if (episode === undefined) {
    return (
      <div className="size-22 text-center vertical-align-middle text-slate-700 italic">
        טוען פרק
      </div>
    );
  }

  if (!episode || !podcastData) {
    return null;
  }

  // Create episode data that matches the expected EpisodeData interface
  const episodeData = {
    ...episode,
    id: episode.episodeNumber, // Map episodeNumber to id
    podcast: podcastData.name, // Use podcast name as string
    createdAt: new Date(episode.createdAt),
    updatedAt: new Date(episode.updatedAt),
    duration: episode.duration || null, // Convert undefined to null
    link: episode.link || null, // Convert undefined to null
    description: episode.description || null, // Convert undefined to null
    htmlDescription: episode.htmlDescription || null, // Convert undefined to null
    imageUrl: episode.imageUrl || null, // Convert undefined to null
    publishedAt: episode.publishedAt ? new Date(episode.publishedAt) : null, // Convert number to Date, undefined to null
    guid: episode.guid || null, // Convert undefined to null
  };

  return <LastEpisodeCardPreview episode={episodeData as any} />;
}
