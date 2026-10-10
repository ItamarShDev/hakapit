import { api } from "convex/_generated/api";
import { on, type Handle } from "remix/component";

import { EpisodeCard } from "~/features/podcast/episode-card";
import { subscribe } from "~/integrations/convex/subscription";

import type { PodcastName } from "~/features/podcast/podcasts";
import type { PodcastWithEpisodes } from "~/features/podcast/types";
type FeedProps = { data: PodcastWithEpisodes | null; podcast: PodcastName };
export function MasonryFeed(handle: Handle<FeedProps>) {
  let limit = 10;
  const liveData = subscribe(handle, api.podcasts.getPodcastWithEpisodes, () => ({
    name: handle.props.podcast,
    limit,
  }));
  return () => {
    const data = liveData() ?? handle.props.data;
    const hasMore = (data?.episodes.length ?? 0) < (data?.totalEpisodes ?? 0);
    return (
      <>
        <div className="masonry">
          {data?.episodes.map((episode) => (
            <EpisodeCard
              key={episode.guid ?? episode.episodeNumber}
              episode={{ ...episode, podcast: { name: handle.props.podcast } }}
            />
          ))}
        </div>
        {hasMore && (
          <div className="mt-6 flex w-full justify-center">
            <button
              type="button"
              className="inline-flex w-fit min-w-44 items-center justify-center rounded-xl border border-white/10 bg-black/20 px-6 py-3 text-center text-sm font-medium text-white/90 shadow-md transition hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-60"
              mix={on("click", () => {
                limit += 5;
                liveData.refresh();
                handle.update();
              })}
            >
              הצג עוד
            </button>
          </div>
        )}
      </>
    );
  };
}
export function FeedPage(handle: Handle<FeedProps>) {
  return () => (
    <div className="flex flex-col gap-4 items-center">
      <span className="p-4 font-light info crazy-font font-display">{handle.props.data?.description}</span>
      <MasonryFeed {...handle.props} />
    </div>
  );
}
