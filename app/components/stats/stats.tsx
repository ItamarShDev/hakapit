import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Suspense } from "react";
import { TeamTournamentInformation } from "~/components/stats/tables";
import { getLeague, getTeam } from "~/providers/soccer-api";
import type { League } from "~/providers/soccer-api/types/league";

export async function StatTable({ leagueId, initialData }: { leagueId: string; initialData?: League }) {
	const league = initialData ?? (await getLeague(leagueId));
	if (!league?.competition) return null;

	const { id: leagueID, name: leagueName, emblem } = league.competition;
	if (!leagueID || !leagueName) return null;

	return (
		<div className="animate-fade flex flex-col w-full" key={leagueID}>
			<div className="bg-accent text-slate-900 flex items-center justify-center px-6 py-2 gap-4">
				<div className="text-xl font-bold">{leagueName}</div>
				<Image className="h-[30px]" src={emblem} alt={`${leagueName} logo`} />
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
				<Image className="h-[50px]" src={`https://crests.football-data.org/${leagueId}.png`} alt="league logo" />
				<div className="font-bold">טוען טורניר</div>
			</div>
		</div>
	);
}

async function StatsList() {
	const team = await getTeam();
	if (!team?.runningCompetitions) return null;

	// Get unique league IDs
	const leagueIds = Array.from(new Set(team.runningCompetitions.map((c) => c.code).filter(Boolean)));
	// Fetch all league data in parallel
	const leaguesData = await Promise.all(leagueIds.map((leagueId) => getLeague(leagueId)));

	return leaguesData.map((league, index) => {
		const leagueId = leagueIds[index];
		if (!league || !leagueId) return null;

		return (
			<Suspense key={leagueId} fallback={<StatsSkeleton leagueId={leagueId} />}>
				<StatTable leagueId={leagueId} initialData={league} />
			</Suspense>
		);
	});
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
