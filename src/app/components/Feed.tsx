import { useEffect, useMemo, useState } from "react";
import { EpisodeCard } from "~/app/components/EpisodeCard";
import { usePodcastWithEpisodes } from "~/app/hooks/usePodcasts";
import type { fetchUpdatedFeed, PodcastName } from "~/app/providers/rss/feed";

type FeedData = Awaited<ReturnType<typeof fetchUpdatedFeed>>;

export function MasonryFeed({ data, podcast }: { data: FeedData; podcast: PodcastName }) {
	const [currentLimit, setCurrentLimit] = useState(10);

	const liveData = usePodcastWithEpisodes(podcast, currentLimit);
	const effectiveData = liveData ?? data;
	const [stickyData, setStickyData] = useState<FeedData>(data);
	useEffect(() => {
		if (effectiveData) setStickyData(effectiveData);
	}, [effectiveData]);

	const stableData = stickyData;
	const loadedCount = stableData?.episodes?.length ?? 0;
	const totalCount = stableData?.totalEpisodes ?? 0;
	const hasMore = totalCount > 0 ? loadedCount < totalCount : true;
	const nextLimit = useMemo(() => currentLimit + 5, [currentLimit]);
	return (
		<>
			<div className="masonry">
				{stableData?.episodes?.map((episode) => (
					<EpisodeCard
						key={String(
							(episode as { _id?: unknown } | null | undefined)?._id ?? episode.guid ?? episode.episodeNumber,
						)}
						episode={episode}
					/>
				))}
			</div>
			{hasMore ? (
				<div className="mt-6 flex w-full justify-center">
					<button
						type="button"
						className="inline-flex w-fit min-w-44 items-center justify-center rounded-xl border border-white/10 bg-black/20 px-6 py-3 text-center text-sm font-medium text-white/90 shadow-md transition hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-60"
						onClick={() => setCurrentLimit(nextLimit)}
					>
						הצג עוד
					</button>
				</div>
			) : null}
		</>
	);
}

export function FeedPage({ data, podcast }: { data: FeedData; podcast: PodcastName }) {
	return (
		<div className="flex flex-col gap-4 items-center">
			<span className={"p-4 font-light info crazy-font font-display"}>{data?.description}</span>
			<MasonryFeed data={data} podcast={podcast} />
		</div>
	);
}
