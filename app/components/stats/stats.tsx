import { TournamentInformation } from "~/components/stats/tables";
import { getLeague } from "~/server/fotmob-api";

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

export function StatsTable({ leaguesIds }: { leaguesIds: (string | undefined)[] }) {
	return (
		<div className="grid items-start w-full gap-3 grid-col-responsive ">
			{leaguesIds?.map((league) => league && <StatTable key={league} leagueId={league} />)}
		</div>
	);
}
