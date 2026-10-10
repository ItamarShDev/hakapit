import { api } from "convex/_generated/api";
import { type Handle } from "remix/component";

import { LastEpisodeCardPreview } from "~/features/podcast/episode-card";
import { subscribe } from "~/integrations/convex/subscription";

import type { PodcastName } from "~/features/podcast/podcasts";
import type { Episode } from "~/features/podcast/types";
export function LatestEpisode(handle: Handle<{ podcast: PodcastName; initialEpisode?: Episode | null }>) {
  const liveEpisode = subscribe(handle, api.podcasts.getLatestEpisode, { podcastName: handle.props.podcast });
  return () => {
    const episode = liveEpisode() ?? handle.props.initialEpisode;
    return episode ? (
      <LastEpisodeCardPreview episode={{ ...episode, podcast: { name: handle.props.podcast } }} />
    ) : null;
  };
}
