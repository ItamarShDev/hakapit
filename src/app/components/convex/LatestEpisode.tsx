import type { Doc } from "convex/_generated/dataModel";
import { LastEpisodeCardPreview } from "~/app/components/EpisodeCard";
import { useLatestEpisode, usePodcastWithEpisodes } from "~/app/hooks/usePodcasts";

type EpisodeDoc = Doc<"episodes"> | null | undefined;

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

	// Create episode data that matches the expected EpisodeData interface
	const episodeData = {
		...episode,
		id: episode.episodeNumber ?? episode._id, // Map episodeNumber to id
		podcast: podcastName, // Use podcast name as string
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
