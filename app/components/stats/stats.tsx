import type { Team } from "fotmob/dist/esm/types/team";
import type { Jsonify } from "type-fest";
import { TournamentInformation } from "~/components/stats/tables";
export function StatsTable({ teamData }: { teamData: Jsonify<Team> }) {
	return (
		<div className="grid items-start w-full gap-3 grid-col-responsive cols-f">
			{teamData?.table?.map((league) => {
				return (
					<div className="flex flex-col" key={league?.data?.leagueId}>
						<div className="flex flex-row-reverse items-center justify-center gap-8 p-3 bg-accent text-slate-900">
							<img
								className="h-[50px]"
								src={`https://images.fotmob.com/image_resources/logo/leaguelogo/${league?.data?.leagueId}.png`}
								alt={`${league?.data?.leagueName} logo`}
							/>
							<div className="font-bold">{league?.data?.leagueName}</div>
						</div>
						<div className="py-3">
							<TournamentInformation league={league} teamData={teamData} />
						</div>
					</div>
				);
			})}
		</div>
	);
}
