import type { Team } from "fotmob/dist/esm/types/team";
import type { Jsonify } from "type-fest";
import { TournamentInformation } from "~/components/stats/tables";
import { useLeagues } from "~/hooks";

export function StatsTable({ teamData }: { teamData: Jsonify<Team> }) {
	const leaguesData = useLeagues(teamData.stats?.primaryLeagueId);

	if (leaguesData?.state === "loading" && leaguesData.data === undefined) {
		return <div>טוען טבלאות...</div>;
	}
	return (
		<div className="grid items-start w-full gap-3 grid-col-responsive ">
			{leaguesData?.data?.map((league) => {
				const table = league?.table?.[0];
				const leagueId = table ? table?.data?.leagueId : league.details?.id;
				const leagueName = table ? table?.data?.leagueName : league.details?.name;
				if (!leagueId || !leagueName) return null;
				return (
					<div className="flex flex-col" key={leagueId}>
						<div className="flex items-center justify-center gap-8 p-3 bg-accent text-slate-900">
							<img
								className="h-[50px]"
								src={`https://images.fotmob.com/image_resources/logo/leaguelogo/${leagueId}.png`}
								alt={`${leagueName} logo`}
							/>
							<div className="font-bold">{leagueName}</div>
						</div>
						<div className="py-3">
							<TournamentInformation league={league} />
						</div>
					</div>
				);
			})}
		</div>
	);
}
