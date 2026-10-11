import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";

import { isSameEpisode } from "~/features/podcast/episode-identity";
import { LATEST_IMAGE_SIZES } from "~/features/podcast/image-layout";
import { PlayButton } from "~/features/podcast/play-button";
import { usePlayer } from "~/layouts/player/provider";
import { toDateString } from "~/lib/format-date";
import { Button } from "~/lib/ui/button";

import type { EpisodeWithPodcast } from "~/features/podcast/types";

export function LatestEpisodePlaybackControl({ episode }: { episode: EpisodeWithPodcast }) {
  const playerProps = usePlayer();
  const isCurrentEpisode = isSameEpisode(playerProps?.currentlyPlaying, episode);
  const playbackAction = isCurrentEpisode && playerProps?.isPlaying ? "השהה" : "הפעל";

  if (!playerProps) return null;

  return (
    <Button
      type="button"
      aria-label={`${playbackAction} פרק: ${episode.title}`}
      className="size-10 md:size-14 lg:size-20 md:rounded-full relative p-3 overflow-hidden"
      onClick={() => playerProps.setCurrentlyPlaying(episode)}
    >
      {episode.imageUrl && (
        <div className="absolute inset-0 overflow-hidden z-0">
          <Image
            src={episode.imageUrl}
            alt=""
            loading="eager"
            fetchPriority="high"
            sizes={LATEST_IMAGE_SIZES}
            className="min-h-full w-auto brightness-40 filter object-cover object-top"
            layout="fullWidth"
          />
        </div>
      )}
      <PlayButton episode={episode} size="md" />
    </Button>
  );
}

export function LastEpisodeCardPreview({ episode }: { episode: EpisodeWithPodcast }) {
  const isoDate = toDateString(episode?.publishedAt ? new Date(episode.publishedAt) : null);
  const podcast = episode?.podcast?.name || "hakapit";
  const episodeNumber = episode?.episodeNumber;

  return (
    <div className="flex items-center justify-center w-full gap-4 py-4">
      <LatestEpisodePlaybackControl episode={episode} />
      <div className="text-accent flex flex-col items-start">
        <Link
          preload="intent"
          className="text-base md:text-lg lg:text-xl"
          to="/$podcast/episodes/$id"
          params={{ podcast, id: String(episodeNumber) }}
        >
          {episode?.title}
        </Link>
        <div className="text-muted flex items-start gap-3 text-sm">
          <div className="">{isoDate}</div>
        </div>
      </div>
    </div>
  );
}
