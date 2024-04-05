import { getLeagueImage } from "~/api/sofascore-api/constants";
import type { LeagueStats } from "~/api/sofascore-api/index.server";
import { TournamentInformation } from "~/components/stats/tables";
type TableProps = { leaguesData: LeagueStats };

export const StatsTable: React.FC<TableProps> = ({ leaguesData }) => (
	<div className="grid items-start w-full gap-3 grid-col-responsive cols-f">
		{leaguesData.leagues.map((league, index) => {
			const leagueId = league?.standings[0].tournament.id;
			const tournamentId = league?.standings[0].tournament.uniqueTournament.id;
			const name = league?.standings[0].tournament?.name;
			return (
				<div className="flex flex-col" key={leagueId}>
					<div className="flex flex-row-reverse items-center justify-center gap-8 p-3 bg-accent text-slate-900">
						<img className="h-[50px]" src={getLeagueImage(tournamentId)} alt={`${name} logo`} />
						<div className="font-bold">{name}</div>
					</div>
					<div className="py-3">
						<TournamentInformation leaguesData={leaguesData} index={index} />
					</div>
				</div>
			);
		})}
	</div>
);
