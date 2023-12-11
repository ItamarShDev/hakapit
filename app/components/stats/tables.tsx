import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { LiverpoolId } from "~/api/fortmob-api/constants";
import type { Team } from "~/api/fortmob-api/src/types/team";
import { ResultTooltip, getFormColor } from "~/components/stats/form";

function getLeagueInfo(league: Team["table"][0]) {
  if (league.data.tables) {
    return league.data.tables
      .map((table) => table.table.all.find((team) => team.id === LiverpoolId))
      .filter((team) => team)[0];
  }
  return league.data.table?.all.find((team) => team.id === LiverpoolId);
}

export function TournamentInformation({
  league,
}: {
  league?: Team["table"][0];
}) {
  if (!league) return null;
  const standings = getLeagueInfo(league);
  const form = league.teamForm[LiverpoolId];
  return (
    <Table>
      <TableBody>
        <TableRow className="border-0">
          <TableCell className="p-3 text-start text-slate-300">מיקום</TableCell>
          <TableCell className="p-3 font-bold text-start">
            {standings?.idx}
          </TableCell>
        </TableRow>
        <TableRow className="border-0">
          <TableCell className="p-3 text-start text-slate-300">
            נקודות
          </TableCell>
          <TableCell className="p-3 font-bold text-start">
            {standings?.pts}
          </TableCell>
        </TableRow>
        <TableRow className="border-0">
          <TableCell className="p-3 text-start text-slate-300">
            ביצועים
          </TableCell>
          <TableCell className="p-3 text-start">
            <div className="flex items-center">
              {form?.map((game) => (
                <ResultTooltip game={game} key={game.linkToMatch}>
                  <Avatar className="h-[25px] w-[25px]">
                    <AvatarFallback
                      className={`scale-75 ${getFormColor(game.resultString)}`}
                    >
                      {game.resultString}
                    </AvatarFallback>
                  </Avatar>
                </ResultTooltip>
              ))}
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
