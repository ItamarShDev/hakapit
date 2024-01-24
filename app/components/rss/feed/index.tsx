import { cn } from "@/lib/utils";
import { NavLink } from "@remix-run/react";
import { useEffect, useState } from "react";
import { MasonryFeed, Preview } from "~/components/rss/feed/feed";
import { Podcast } from "~/db/types";
function getLinkClass(isPending: boolean) {
	return cn("text-xl lg:text-sm text-accent", isPending ? "animate-pulse" : "");
}
export default function RSSFeed({
	data,
	limit = 1,
	preview = false,
}: {
	data?: Podcast;
	limit?: number;
	preview?: boolean;
}) {
	const [newLimit, setNewLimit] = useState(limit);
	useEffect(() => {
		setNewLimit(limit);
	}, [limit]);

	return (
		<div className="flex flex-col items-center gap-3">
			{preview ? (
				<>
					<Preview data={data} />
					<NavLink to={"episodes"} className={({ isPending }) => getLinkClass(isPending)}>
						לכל הפרקים
					</NavLink>
				</>
			) : (
				<>
					<MasonryFeed data={data} limit={newLimit} />
					<NavLink
						preventScrollReset
						to={`?limit=${limit + 5}`}
						className={({ isPending }) => getLinkClass(isPending)}
						onClick={() => setNewLimit(limit + 5)}
						replace
					>
						הצג עוד
					</NavLink>
				</>
			)}
		</div>
	);
}
