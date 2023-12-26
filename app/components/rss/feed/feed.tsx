import { useNavigation } from "@remix-run/react";
import type { Feed } from "~/api/rss/types";
import { EpisodeCard, SkeletonCard } from "~/components/rss/EpisodeCard";

export function MasonryFeed({
	data,
	podcastName,
	limit,
}: {
	data: Feed | undefined;
	podcastName: "hakapit" | "nitk" | "balcony-albums" | string;
	limit: number;
}) {
	const navigation = useNavigation();
	const skeletonCount = Math.max(limit - (data?.items?.length || 0), 0);

	return (
		<>
			<span className="max-w-xl p-4 font-light info crazy-font big-title">פרקים</span>
			<div className="masonry">
				{data?.items?.map((episode, index) => (
					<EpisodeCard key={episode.episodeGUID} episode={episode} podcastName={podcastName} />
				))}
				{navigation.state !== "idle" &&
					new Array(skeletonCount)
						.fill(0)
						// biome-ignore lint:noArrayIndexKey
						?.map((_, index) => <SkeletonCard key={index} />)}
			</div>
		</>
	);
}
export function Preview({
	data,
	podcastName,
}: {
	data: Feed | undefined;
	podcastName: "hakapit" | "nitk" | "balcony-albums" | string;
}) {
	return (
		<>
			<span className="max-w-xl p-4 font-light info crazy-font">{data?.description}</span>
			<EpisodeCard episode={data?.items[0]} podcastName={podcastName} />
		</>
	);
}
