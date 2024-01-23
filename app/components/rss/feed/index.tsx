import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavLink } from "@remix-run/react";
import { useEffect, useState } from "react";
import { MasonryFeed, Preview } from "~/components/rss/feed/feed";
import { Podcast } from "~/db/types";

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
					<NavLink
						to={"episodes"}
						className={({ isPending }) => (isPending ? "animate-pulse text-accent" : "text-accent")}
					>
						<Button variant="link" className="text-xl lg:text-sm text-accent">
							לכל הפרקים
						</Button>
					</NavLink>
				</>
			) : (
				<>
					<MasonryFeed data={data} limit={newLimit} />
					<NavLink
						preventScrollReset
						to={`?limit=${limit + 5}`}
						className={({ isPending }) =>
							cn("text-xl lg:text-md", isPending ? "animate-pulse text-accent" : "text-accent")
						}
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
