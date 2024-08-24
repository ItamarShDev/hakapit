import { cn } from "@/lib/utils";
import Link from "next/link";
import { MasonryFeed, Preview } from "~/components/rss/feed/feed";
import { type PodcastName, fetchUpdatedFeed } from "~/server/rss/feed";
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
	const data = await fetchUpdatedFeed(podcast, limit);
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
			<Feed limit={limit} preview={preview} podcast={podcast} />
		</div>
	);
}
