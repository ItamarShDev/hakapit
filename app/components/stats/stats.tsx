import { Await } from "@remix-run/react";
import { Suspense } from "react";
import type { Team, TeamStats } from "~/api/fotmob-api/src/types/team";
import { GamesRadar } from "~/components/stats/radar";
import { TournamentInformation } from "~/components/stats/tables";

export const StatsTable: React.FC<{
  teamData: Team;
  leagueStats: Promise<TeamStats[]>;
}> = ({ teamData, leagueStats }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <Await resolve={leagueStats}>
      {(leagueStats) => {
        return (
          <div className="grid items-start w-full gap-3 grid-col-responsive cols-f">
            {teamData.table.map((league) => {
              const tournamentId = teamData.history.tables.current[0].link.find(
                (season) =>
                  season.template_id[0] === league.data.leagueId.toString()
              )?.tournament_id[0];

              return (
                <div className="flex flex-col" key={league.data.leagueId}>
                  <div className="flex flex-row-reverse items-center justify-center gap-8 p-3 bg-accent text-slate-900">
                    <img
                      className="h-[50px]"
                      src={`https://images.fotmob.com/image_resources/logo/leaguelogo/${league.data.leagueId}.png`}
                      alt={league.data.leagueName}
                    />
                    <div className="font-bold">{league.data.leagueName}</div>
                  </div>
                  <div className="py-3">
                    <TournamentInformation
                      league={league}
                      stats={leagueStats.find(
                        (stats) => stats.tournamentId === tournamentId
                      )}
                    />
                  </div>
                  <div className="h-[250px]">
                    <GamesRadar
                      fixtures={teamData.fixtures}
                      leagueId={league.data.leagueId}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      }}
    </Await>
  </Suspense>
);