import { on, unsafeHTML, type Handle, type Props } from "remix/component";

import { Link } from "~/components/link";
import { PlayButton } from "~/features/podcast/play-button";
import { PlayerProvider } from "~/layouts/player/provider";
import { heebo } from "~/lib/fonts";
import { toDateString } from "~/lib/format-date";
import { sanitizeContent } from "~/lib/html";
import { Button } from "~/lib/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/lib/ui/card";
import { Image } from "~/lib/ui/image";
import { cn } from "~/lib/utils";

import type { EpisodeWithPodcast } from "~/features/podcast/types";

export function LastEpisodeCardPreview(handle: Handle<{ episode: EpisodeWithPodcast }>) {
  return () => {
    const { episode } = handle.props;

    const isoDate = toDateString(episode?.publishedAt ? new Date(episode.publishedAt) : null);
    const playerProps = handle.context.get(PlayerProvider);
    const podcast = episode?.podcast?.name || "hakapit";
    const episodeNumber = episode?.episodeNumber;

    return (
      <div className="flex items-center justify-center w-full gap-4 py-4">
        {playerProps && (
          <Button
            className="size-10 md:size-14 lg:size-20 md:rounded-full relative p-3 overflow-hidden"
            mix={on("click", () => playerProps.setCurrentlyPlaying(episode))}
          >
            {episode?.imageUrl && (
              <div className="absolute inset-0 overflow-hidden z-0">
                <Image
                  src={episode?.imageUrl}
                  alt="episode"
                  sizes="(min-width: 768px) 56px, 80px"
                  className="min-h-full w-auto brightness-40 filter object-cover object-top"
                  layout="fullWidth"
                />
              </div>
            )}
            <PlayButton episode={episode} size="md" />
          </Button>
        )}
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
  };
}

export function EpisodeCard(
  handle: Handle<
    {
      episode?: EpisodeWithPodcast;
      contentClassName?: Props<"div">["className"];
    } & Props<"div">
  >,
) {
  return () => {
    const { episode, className, contentClassName } = handle.props;

    const isoDate = toDateString(episode?.publishedAt ? new Date(episode.publishedAt) : null);
    const playerProps = handle.context.get(PlayerProvider);
    const podcast = episode?.podcast?.name || "hakapit";
    const episodeNumber = episode?.episodeNumber;
    const viewTransitionKey = episode?.guid ? String(episode.guid) : episodeNumber != null ? String(episodeNumber) : "";

    return (
      <Card
        className={cn(
          "episode-card relative max-w-xl max-h-[450px] rounded-3xl overflow-hidden flex flex-col",
          className,
          heebo.className,
        )}
      >
        {episode?.imageUrl && (
          <div className="absolute inset-0 overflow-hidden rounded-3xl z-0">
            <Image
              src={episode?.imageUrl}
              alt="episode"
              loading="eager"
              sizes="576px"
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
            <div className="card-content" innerHTML={unsafeHTML(sanitizeContent(episode?.htmlDescription))} />
          )}
        </CardContent>
        <CardFooter className="mt-auto">
          {playerProps ? (
            <Button
              disabled={playerProps.currentlyPlaying?.guid === episode?.guid}
              className="z-10 w-full"
              mix={on("click", () => playerProps.setCurrentlyPlaying(episode))}
            >
              <div className="flex items-center justify-center gap-2">
                {episode && <PlayButton episode={episode} size="sm" />}
                {playerProps.currentlyPlaying?.guid === episode?.guid ? "מנגן כרגע" : "נגן פרק"}
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
  };
}
