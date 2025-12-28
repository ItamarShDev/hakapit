import type { League } from "~/app/providers/soccer-api/types/league";
import { TeamTournamentInformation } from "./Tables";

export function StatTable({ initialData }: { leagueId: string; initialData: League }) {
	const league = initialData;

	if (!league?.competition) return null;

	const { id: leagueID, name: leagueName, emblem } = league.competition;
	if (!leagueID || !leagueName) return null;

	return (
		<div className="animate-fade flex flex-col w-full max-w-[700px]" key={leagueID}>
			<div className="bg-accent text-slate-900 flex items-center justify-center px-3 sm:px-6 py-2 gap-2 sm:gap-4">
				<div className="text-base sm:text-xl font-bold">{leagueName}</div>
				<img className="h-[24px] w-[24px] sm:h-[30px] sm:w-[30px]" src={emblem} alt={`${leagueName} logo`} />
			</div>
			<div className="py-2 sm:py-4 px-1 sm:px-2">
				<TeamTournamentInformation league={league} />
			</div>
		</div>
	);
}

export function StatsTable({ leaguesData }: { leaguesData: Array<{ leagueId: string; league: League }> }) {
	return (
		<div className="grid-col-responsive grid items-start justify-items-center w-full gap-3 px-2 sm:px-0">
			{leaguesData.map(({ leagueId, league }) => (
				<StatTable key={leagueId} leagueId={leagueId} initialData={league} />
			))}
		</div>
	);
}
