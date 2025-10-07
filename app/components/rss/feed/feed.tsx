import Link from "next/link";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { EpisodeCard } from "~/components/rss/EpisodeCard";
import ShowMore from "~/components/rss/feed/ShowMore.client";
import { amaticSc } from "~/fonts";
import { fetchUpdatedFeed, type PodcastName } from "~/providers/rss/feed";

async function MasonryFeed({ limit = 1, podcast }: { limit?: number; podcast: PodcastName }) {
	const data = await fetchUpdatedFeed(podcast, limit);

	return (
		<Suspense fallback={null}>
			<div className="masonry">
				{data?.episodes?.map((episode) => (
					<EpisodeCard key={episode.guid} episode={episode} />
				))}
			</div>
			<ShowMore limit={limit} currentLimit={data?.episodes.length || 0} />
		</Suspense>
	);
}
async function Preview({ limit = 1, podcast }: { limit?: number; podcast: PodcastName }) {
	const data = await fetchUpdatedFeed(podcast, limit);

	return (
		<Suspense fallback={null}>
			<span className={cn("w-full max-w-xl p-4 font-light info crazy-font", amaticSc.className)}>
				{data?.description}
			</span>
			<div className="masonry">
				<EpisodeCard episode={data?.episodes[0]} />
			</div>
		</Suspense>
	);
}

export async function FeedPage({ limit = 1, podcast }: { limit?: number; podcast: PodcastName }) {
	return (
		<>
			<span className={cn("max-w-xl p-4 font-light info crazy-font big-title", amaticSc.className)}>פרקים</span>
			<MasonryFeed limit={limit} podcast={podcast} />
		</>
	);
}

export async function PreviewPage({ limit = 1, podcast }: { limit?: number; podcast: PodcastName }) {
	return (
		<>
			<Preview limit={limit} podcast={podcast} />
			<Link prefetch={true} href={`${podcast}/episodes`} className={"text-xl lg:text-sm text-accent"}>
				לכל הפרקים
			</Link>
		</>
	);
}
