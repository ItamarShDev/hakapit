import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EpisodeCard } from "~/features/podcast/episode-card";
import { getEpisodeImageKey, useAdaptiveImageLayout } from "~/features/podcast/image-layout";
import { usePodcastWithEpisodes } from "~/features/podcast/use-podcasts";
import { ConvexBoundary } from "~/integrations/convex/convex-boundary";
import { unwrapCdata } from "~/lib/html";

import type { PodcastName } from "~/features/podcast/podcasts";
import type { EpisodeWithPodcast } from "~/features/podcast/types";
import type { fetchUpdatedFeed } from "~/server/podcasts";

export type FeedData = Awaited<ReturnType<typeof fetchUpdatedFeed>>;
const EMPTY_EPISODES: EpisodeWithPodcast[] = [];

type FeedLiveBridgeProps = {
  podcast: PodcastName;
  limit: number;
  onData: (data: FeedData) => void;
};

type FeedLiveBridgeComponent = React.ComponentType<FeedLiveBridgeProps>;
type FeedCardProps = {
  episode: NonNullable<FeedData>["episodes"][number];
  imageKey: string;
  imageSizes: string;
  priority: boolean;
};
type FeedCardComponent = React.ComponentType<FeedCardProps>;

export function FeedLiveBridge({ podcast, limit, onData }: FeedLiveBridgeProps) {
  const liveData = usePodcastWithEpisodes(podcast, limit);

  useEffect(() => {
    if (liveData !== undefined) {
      onData(liveData);
    }
  }, [liveData, onData]);

  return null;
}

export function shouldPrioritizeEpisodeImage(index: number) {
  return index === 0;
}

function LiveRecovery({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-sm text-paragraph" role="alert">
      <span>החיבור לעדכון הפרקים נכשל.</span>
      <button
        type="button"
        className="rounded-lg border border-white/20 px-3 py-1.5 font-medium hover:bg-black/20"
        onClick={onRetry}
      >
        נסה שוב
      </button>
    </div>
  );
}

export function MasonryFeed({
  data,
  podcast,
  liveBridge: LiveBridge = FeedLiveBridge,
  feedCard: FeedCard = EpisodeCard,
}: {
  data: FeedData;
  podcast: PodcastName;
  liveBridge?: FeedLiveBridgeComponent;
  feedCard?: FeedCardComponent;
}) {
  const [currentLimit, setCurrentLimit] = useState(10);
  const [liveAttempt, setLiveAttempt] = useState(0);
  const [liveData, setLiveData] = useState<FeedData | undefined>(undefined);
  const [snapshot, setSnapshot] = useState<FeedData>(data);
  const [isLoading, setIsLoading] = useState(true);
  const previousProps = useRef({ data, podcast });

  useEffect(() => {
    if (previousProps.current.data === data && previousProps.current.podcast === podcast) return;
    previousProps.current = { data, podcast };
    setCurrentLimit(10);
    setLiveAttempt(0);
    setLiveData(undefined);
    setSnapshot(data);
    setIsLoading(true);
  }, [data, podcast]);

  const publishLiveData = useCallback((resolvedData: FeedData) => {
    setLiveData(resolvedData);
    setIsLoading(false);
    if (resolvedData !== null) {
      setSnapshot(resolvedData);
    }
  }, []);

  const retryLive = useCallback(() => {
    setLiveData(undefined);
    setIsLoading(true);
    setLiveAttempt((attempt) => attempt + 1);
  }, []);

  const renderLiveRecovery = useCallback(
    (retry: () => void) => (
      <LiveRecovery
        onRetry={() => {
          retryLive();
          retry();
        }}
      />
    ),
    [retryLive],
  );

  const displayData = liveData === undefined ? snapshot : liveData;
  const episodes = displayData?.episodes ?? EMPTY_EPISODES;
  const { gridRef, imageSizes, priorityKeys } = useAdaptiveImageLayout(episodes);
  const nextLimit = useMemo(() => currentLimit + 5, [currentLimit]);
  const hasMore =
    displayData !== null && displayData !== undefined
      ? displayData.totalEpisodes != null
        ? episodes.length < displayData.totalEpisodes
        : episodes.length >= currentLimit
      : false;

  const loadMore = () => {
    if (isLoading) return;
    setIsLoading(true);
    setLiveData(undefined);
    setCurrentLimit(nextLimit);
  };

  return (
    <>
      <ConvexBoundary fallback={renderLiveRecovery}>
        <LiveBridge
          key={`${podcast}-${currentLimit}-${liveAttempt}`}
          podcast={podcast}
          limit={currentLimit}
          onData={publishLiveData}
        />
      </ConvexBoundary>
      {isLoading && !displayData ? (
        <div className="mt-6 text-center text-paragraph" role="status" aria-live="polite">
          טוען פרקים...
        </div>
      ) : null}
      {!isLoading && (!displayData || episodes.length === 0) ? (
        <div className="mt-6 text-center text-paragraph" role="status" aria-live="polite">
          אין פרקים זמינים כרגע.
        </div>
      ) : null}
      {episodes.length > 0 ? (
        <>
          <div ref={gridRef} className="masonry" aria-busy={isLoading}>
            {episodes.map((episode, index) => {
              const imageKey = getEpisodeImageKey(episode, index);
              return (
                <FeedCard
                  key={imageKey}
                  episode={episode}
                  imageKey={imageKey}
                  imageSizes={imageSizes}
                  priority={priorityKeys.has(imageKey) || shouldPrioritizeEpisodeImage(index)}
                />
              );
            })}
          </div>
          {hasMore ? (
            <div className="mt-6 flex w-full justify-center">
              <button
                type="button"
                className="inline-flex w-fit min-w-44 items-center justify-center rounded-xl border border-white/10 bg-black/20 px-6 py-3 text-center text-sm font-medium text-white/90 shadow-md transition hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={loadMore}
                disabled={isLoading}
                aria-busy={isLoading}
              >
                הצג עוד
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
}

export function FeedPage({ data, podcast }: { data: FeedData; podcast: PodcastName }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <span className="info crazy-font font-display p-4 font-light">{unwrapCdata(data?.description ?? "")}</span>
      <MasonryFeed data={data} podcast={podcast} />
    </div>
  );
}
