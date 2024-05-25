import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { TournamentInformation } from "~/components/stats/tables";
import { getLeague, getLeagues } from "~/server/fotmob-api";

export async function StatTable({ leagueId }: { leagueId: string }) {
	const league = await getLeague(Number.parseInt(leagueId));
	const table = league?.table?.[0];
	const leagueID = table ? table?.data?.leagueId : league.details?.id;
	const leagueName = table ? table?.data?.leagueName : league.details?.name;
	if (!leagueID || !leagueName) return null;
	return (
		<div className="flex flex-col" key={leagueID}>
			<div className="flex items-center justify-center gap-8 p-3 bg-accent text-slate-900">
				<img
					className="h-[50px]"
					src={`https://images.fotmob.com/image_resources/logo/leaguelogo/${leagueID}.png`}
					alt={`${leagueName} logo`}
				/>
				<div className="font-bold">{leagueName}</div>
			</div>
			<div className="py-3">
				<TournamentInformation league={league} />
			</div>
		</div>
	);
}
function StatsSkeleton({ leagueId }: { leagueId: string }) {
	return (
		<div className="flex flex-col" key={leagueId}>
			<div className="flex items-center justify-center gap-8 p-3 bg-accent text-slate-900">
				<img
					className="h-[50px]"
					src={`https://images.fotmob.com/image_resources/logo/leaguelogo/${leagueId}.png`}
					alt={"logo"}
				/>
				<div className="font-bold">טוען טורניר</div>
			</div>
		</div>
	);
}
async function StatsList() {
	const leaguesIds = await getLeagues(47);
	return leaguesIds?.map(
		(league) =>
			league && (
				<Suspense key={league} fallback={<StatsSkeleton leagueId={league} />}>
					<StatTable key={league} leagueId={league} />
				</Suspense>
			),
	);
}
function TableSkeleton() {
	return (
		<Skeleton className="h-96 w-full flex items-center justify-center rounded-2xl bg-slate-500 bg-opacity-30">
			טוען טבלאות
		</Skeleton>
	);
}
export function StatsTable() {
	return (
		<div className="grid items-start w-full gap-3 grid-col-responsive ">
			<StatsList />
		</div>
	);
}
