import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Await } from "@remix-run/react";
import { Suspense } from "react";
import type { Standings } from "~/api/football/types";

type Point = {
  form: string;
  points: number;
  index: number;
};
function getFormPoints(form: string) {
  return form
    .split("")
    .reverse()
    .reduce<Point[]>((acc, curr, index) => {
      const lastPoints = acc.at(-1)?.points ?? 0;
      const addition = curr == "W" ? 3 : curr == "D" ? 1 : 0;
      const points = lastPoints + (index == 0 ? 0 : addition);
      return [...acc, { form: curr, points: points, index }];
    }, [] as Point[]);
}

function getFormColor(form: string) {
  if (form == "W") return "bg-green-400";
  if (form == "D") return "bg-slate-400";
  if (form == "L") return "bg-red-400";
}

export const StandingsTable: React.FC<{
  standings: Standings;
}> = ({ standings }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <Await resolve={standings}>
      {(standings: Standings) => (
        <Table>
          <TableCaption>טבלת הליגה המעודכנת</TableCaption>
          <TableHeader className="[&_tr]:border-0">
            <TableRow>
              <TableHead className="text-start">טורניר</TableHead>
              <TableHead className="w[100px] text-start">מיקום</TableHead>
              <TableHead className="text-start">נקודות</TableHead>
              <TableHead className="text-start">מצב</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.response.map(({ league }, idx) => {
              const standing = league.standings[0][0];
              return (
                <TableRow key={idx} className="border-0">
                  <TableCell className="p-3 text-start">
                    {league.name}
                  </TableCell>
                  <TableCell className="p-3 text-start">
                    {standing.rank}
                  </TableCell>
                  <TableCell className="p-3 text-start">
                    {standing.points}
                  </TableCell>
                  <TableCell className="text-start">
                    <div className="flex items-center">
                      {getFormPoints(standing.form).map(
                        ({ form, points, index }) => (
                          <Avatar
                            key={`${index}-${points}`}
                            className="h-[25px] w-[25px]"
                          >
                            <AvatarFallback
                              className={`scale-75 ${getFormColor(form)}`}
                            >
                              {form}
                            </AvatarFallback>
                          </Avatar>
                        )
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Await>
  </Suspense>
);
