import { useNavigation } from "@remix-run/react";
import { EpisodeCard, SkeletonCard } from "~/components/rss/EpisodeCard";
import type { FeedData } from "~/hooks";

export function MasonryFeed({
	data,
	limit,
}: {
	data?: FeedData;
	limit: number;
}) {
	const navigation = useNavigation();
	const skeletonCount = Math.max(limit - (data?.episodes?.length || 0), 0);

	return (
		<>
			<span className="max-w-xl p-4 font-light info crazy-font big-title">פרקים</span>
			<div className="masonry">
				{data?.episodes?.map((episode) => (
					<EpisodeCard key={episode.guid} episode={episode} />
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
}: {
	data?: FeedData;
}) {
	return (
		<>
			<span className="w-full max-w-xl p-4 font-light info crazy-font">{data?.description}</span>
			<div className="masonry">
				<EpisodeCard episode={data?.episodes[0]} />
			</div>
		</>
	);
}
