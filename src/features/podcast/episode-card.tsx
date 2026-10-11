import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";

import { isSameEpisode } from "~/features/podcast/episode-identity";
import { FEED_IMAGE_SIZES } from "~/features/podcast/image-layout";
import { PlayButton } from "~/features/podcast/play-button";
import { usePlayer } from "~/layouts/player/provider";
import { heebo } from "~/lib/fonts";
import { toDateString } from "~/lib/format-date";
import { sanitizeContent } from "~/lib/html";
import { Button } from "~/lib/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/lib/ui/card";
import { cn } from "~/lib/utils";

import type { EpisodeWithPodcast } from "~/features/podcast/types";

export function EpisodeCard({
  episode,
  className,
  contentClassName,
  priority = false,
  imageKey,
  imageSizes = FEED_IMAGE_SIZES,
}: {
  episode?: EpisodeWithPodcast;
  contentClassName?: React.HTMLAttributes<HTMLDivElement>["className"];
  priority?: boolean;
  imageKey?: string;
  imageSizes?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const isoDate = toDateString(episode?.publishedAt ? new Date(episode.publishedAt) : null);
  const playerProps = usePlayer();
  const podcast = episode?.podcast?.name || "hakapit";
  const episodeNumber = episode?.episodeNumber;
  const viewTransitionKey = episode?.guid ? String(episode.guid) : episodeNumber != null ? String(episodeNumber) : "";
  const isCurrentEpisode = isSameEpisode(playerProps?.currentlyPlaying, episode);
  const playbackLabel = isCurrentEpisode ? "הפרק מתנגן" : "הפעל פרק";

  return (
    <Card
      className={cn(
        "episode-card relative max-w-xl max-h-[450px] rounded-3xl overflow-hidden flex flex-col",
        className,
        heebo.className,
      )}
      data-image-key={imageKey}
    >
      {episode?.imageUrl && (
        <div className="absolute inset-0 overflow-hidden rounded-3xl z-0">
          <Image
            src={episode?.imageUrl}
            alt=""
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            sizes={imageSizes}
            className="min-h-full w-auto brightness-40 filter blur-xs object-cover object-top"
            layout="fullWidth"
          />
        </div>
      )}
      <CardHeader className="z-10">
        <CardTitle className="text-accent">
          <Link
            to="/$podcast/episodes/$id"
            params={{ podcast, id: String(episodeNumber) }}
            style={viewTransitionKey ? { viewTransitionName: `episode-title-${viewTransitionKey}` } : undefined}
          >
            {episode?.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-muted">{isoDate}</CardDescription>
      </CardHeader>
      <CardContent
        style={viewTransitionKey ? { viewTransitionName: `episode-content-${viewTransitionKey}` } : undefined}
        className={cn("flex-1 min-h-0 text-paragraph z-10 overflow-hidden", contentClassName)}
      >
        {episode?.htmlDescription && (
          <div
            className="card-content"
            dangerouslySetInnerHTML={{
              __html: sanitizeContent(episode.htmlDescription),
            }}
          />
        )}
      </CardContent>
      <CardFooter className="mt-auto">
        {playerProps ? (
          <Button
            disabled={isCurrentEpisode}
            aria-label={`${playbackLabel}: ${episode?.title ?? "פרק"}`}
            className="z-10 w-full"
            onClick={() => playerProps.setCurrentlyPlaying(episode)}
          >
            <div className="flex items-center justify-center gap-2">
              {episode && <PlayButton episode={episode} size="sm" />}
              {isCurrentEpisode ? "מנגן כרגע" : "נגן פרק"}
            </div>
          </Button>
        ) : (
          <audio className="audio" controls src={episode?.audioUrl}>
            <track kind="captions" />
          </audio>
        )}
      </CardFooter>
    </Card>
  );
}
