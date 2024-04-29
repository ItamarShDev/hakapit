import { cn } from "@/lib/utils";
import Link from "next/link";
import { MasonryFeed, Preview } from "~/components/rss/feed/feed";
import type { FeedData } from "~/utils";
function getLinkClass(isPending = false) {
	return cn("text-xl lg:text-sm text-accent", isPending ? "animate-pulse" : "");
}
export default function RSSFeed({
	data,
	limit = 1,
	preview = false,
	podcast,
}: {
	data?: FeedData;
	limit?: number;
	preview?: boolean;
	podcast: "hakapit" | "balcony-albums" | "nitk";
}) {
	return (
		<div className="flex flex-col items-center gap-3">
			{preview ? (
				<>
					<Preview data={data} />
					<Link href={`${podcast}/episodes`} className={getLinkClass()}>
						לכל הפרקים
					</Link>
				</>
			) : (
				<>
					<MasonryFeed data={data} limit={limit} />
					<Link href={`?limit=${limit + 5}`} replace className={getLinkClass()} scroll={false}>
						הצג עוד
					</Link>
				</>
			)}
		</div>
	);
}
