import { cn } from "@/lib/utils";
import { EpisodeCard, SkeletonCard } from "~/components/rss/EpisodeCard";
import { amaticSc } from "~/fonts";
import type { FeedData } from "~/utils";

export function MasonryFeed({
	data,
	limit,
}: {
	data?: FeedData;
	limit: number;
}) {
	const skeletonCount = Math.max(limit - (data?.episodes?.length || 0), 0);
	return (<>
        <span className={cn("max-w-xl p-4 font-light info crazy-font big-title", amaticSc.className)}>פרקים</span>
        <div className="masonry">
            {data?.episodes?.map((episode) => (
                <EpisodeCard key={episode.guid} episode={episode} />
            ))}
            {new Array(skeletonCount).fill(0)?.map((_, index) => (
                // biome-ignore lint:noArrayIndexKey
                (<SkeletonCard key={index} className="h-[500px]" />)
            ))}
        </div>
    </>);
}
export function Preview({
	data,
}: {
	data?: FeedData;
}) {
	return (
		<>
			<span className={cn("w-full max-w-xl p-4 font-light info crazy-font", amaticSc.className)}>
				{data?.description}
			</span>
			<div className="masonry">
				<EpisodeCard episode={data?.episodes[0]} />
			</div>
		</>
	);
}
