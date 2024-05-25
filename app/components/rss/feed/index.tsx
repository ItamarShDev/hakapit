import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { MasonryFeed, Preview } from "~/components/rss/feed/feed";
import { fetchFeed, type PodcastName } from "~/server/rss/feed";
function getLinkClass(isPending = false) {
	return cn("text-xl lg:text-sm text-accent", isPending ? "animate-pulse" : "");
}
async function Feed({
	limit = 1,
	preview = false,
	podcast,
}: {
	limit?: number;
	preview?: boolean;
	podcast: PodcastName;
}) {
	const data = await fetchFeed(podcast, limit);
	if (preview)
		return (
			<>
				<Preview data={data} />
				<Link href={`${podcast}/episodes`} className={getLinkClass()}>
					לכל הפרקים
				</Link>
			</>
		);
	return (
		<>
			<MasonryFeed data={data} limit={limit} />
			<Link href={`?limit=${limit + 5}`} replace className={getLinkClass()} scroll={false}>
				הצג עוד
			</Link>
		</>
	);
}
function SkeletonCard() {
	return (
		<div className="flex flex-col space-y-3">
			<Skeleton className="h-[125px] w-[250px] rounded-xl" />
			<div className="space-y-2">
				<Skeleton className="h-4 w-[250px]" />
				<Skeleton className="h-4 w-[200px]" />
			</div>
		</div>
	);
}
function FeedSkeletons({
	limit = 1,
	preview = false,
}: {
	limit?: number;
	preview?: boolean;
}) {
	if (preview) {
		return <SkeletonCard />;
	}
	// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
	return new Array(limit).fill(null).map((_, index) => <SkeletonCard key={index} />);
}
export default async function RSSFeed({
	limit = 1,
	preview = false,
	podcast,
}: {
	limit?: number;
	preview?: boolean;
	podcast: PodcastName;
}) {
	return (
		<div className="flex flex-col items-center gap-3">
			<Suspense fallback={<FeedSkeletons limit={limit} preview={preview} />}>
				<Feed limit={limit} preview={preview} podcast={podcast} />
			</Suspense>
		</div>
	);
}
