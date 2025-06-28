import { Skeleton } from "@/components/ui/skeleton";
import { FullBleed, NextMatchOverviewClient } from "~/components/next-match.client";
import { getNextMatchData } from "~/providers/soccer-api";

function NextMatchSkeleton() {
	return (
		<FullBleed>
			<div className="flex flex-col items-center justify-center gap-2">
				<Skeleton className="rounded-2xl bg-slate-500 bg-opacity-30 w-20 h-4" />
				<Skeleton className="rounded-2xl bg-slate-500 bg-opacity-30 w-24 h-6" />
				<Skeleton className="w-80 rounded-2xl bg-slate-500 bg-opacity-30 h-16" />
			</div>
		</FullBleed>
	);
}

export async function NextMatchOverview() {
	const data = await getNextMatchData();
	if (!data) return <NextMatchSkeleton />;
	return <NextMatchOverviewClient data={data} />;
}
