import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { TeamTournamentInformation } from "~/components/stats/tables";
import { getLeague, getLeagues } from "~/server/fotmob-api";

export async function StatTable({ leagueId }: { leagueId: string }) {
	const league = await getLeague(Number.parseInt(leagueId));
	const table = league?.table?.[0];
	const leagueID = table ? table?.data?.leagueId : league.details?.id;
	const leagueName = table ? table?.data?.leagueName : league.details?.name;
	if (!leagueID || !leagueName) return null;
	return (
		<div className="animate-fade flex flex-col w-full" key={leagueID}>
			<div className="bg-accent text-slate-900 flex items-center justify-center px-6 py-2 gap-4">
				<div className="text-xl font-bold">{leagueName}</div>
				<img
					className="h-[30px]"
					src={`https://images.fotmob.com/image_resources/logo/leaguelogo/${leagueID}.png`}
					alt={`${leagueName} logo`}
				/>
			</div>
			<div className="py-4 px-2">
				<TeamTournamentInformation league={league} />
			</div>
		</div>
	);
}
function StatsSkeleton({ leagueId }: { leagueId: string }) {
	return (
		<div className="flex flex-col" key={leagueId}>
			<div className="bg-accent text-slate-900 flex items-center justify-center gap-8 p-3">
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
	return Array.from(new Set(leaguesIds)).map(
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
		<Skeleton className="h-96 rounded-2xl bg-slate-500 bg-opacity-30 flex items-center justify-center w-full">
			טוען טבלאות
		</Skeleton>
	);
}
export function StatsTable() {
	return (
		<div className="grid-col-responsive grid items-start w-full gap-3">
			<Suspense fallback={<TableSkeleton />}>
				<StatsList />
			</Suspense>
		</div>
	);
}
