import { useNavigation } from "@remix-run/react";
import { EpisodeCard, SkeletonCard } from "~/components/rss/EpisodeCard";
import { Episode, Podcast } from "~/db/types";

export function MasonryFeed({
	data,
	limit,
}: {
	data?: Podcast;
	limit: number;
}) {
	const navigation = useNavigation();
	const skeletonCount = Math.max(limit - (data?.episodes?.length || 0), 0);

	return (
		<>
			<span className="max-w-xl p-4 font-light info crazy-font big-title">פרקים</span>
			<div className="masonry">
				{data?.episodes?.map((episode) => (
					<EpisodeCard key={episode.guid} episode={episode as Episode} />
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
	data?: Podcast;
}) {
	return (
		<>
			<span className="max-w-xl p-4 font-light info crazy-font">{data?.description}</span>
			<EpisodeCard episode={data?.episodes[0] as Episode} />
		</>
	);
}
