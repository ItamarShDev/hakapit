import type { Jsonify } from "type-fest";
import { TournamentInformation } from "~/components/stats/tables";
import { useLeague } from "~/hooks";

export function StatTable({ leagueId }: { leagueId: string }) {
	const fetcher = useLeague(leagueId);
	const league = fetcher.data;
	if (!league) return null;
	if (typeof league === "string") {
		return null;
	}

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

export function StatsTable({ leaguesIds }: { leaguesIds: Jsonify<(string | undefined)[]> }) {
	return (
		<div className="grid items-start w-full gap-3 grid-col-responsive ">
			{Array.from(new Set(leaguesIds))?.map((league) => (
				<StatTable key={league} leagueId={league} />
			))}
		</div>
	);
}
