import Link from "next/link";
import { MasonryFeed, Preview } from "~/components/rss/feed/feed";
import { type PodcastName, fetchUpdatedFeed } from "~/server/rss/feed";

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
				<Link href={`${podcast}/episodes`} className={"text-xl lg:text-sm text-accent"}>
					לכל הפרקים
				</Link>
			</>
		);
	return (
		<>
			<MasonryFeed data={data} limit={limit} />
			<Link href={`?limit=${limit + 5}`} replace className={"text-xl lg:text-sm text-accent"} scroll={false}>
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
