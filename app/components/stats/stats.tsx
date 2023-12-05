import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ResponsiveRadialBar } from "@nivo/radial-bar";
import { Await } from "@remix-run/react";
import { Suspense } from "react";
import type { Standings, Stats } from "~/api/football/types";
function GamesRadar({ fixtures }: { fixtures: Stats["response"]["fixtures"] }) {
  const data = [
    {
      id: "Win",
      data: Object.entries(fixtures.wins)
        .filter(([key, val]) => key !== "total" && val)
        .map(([key, val]) => ({
          x: key,
          y: val as number,
        })),
    },
    {
      id: "Lose",
      data: Object.entries(fixtures.loses)
        .filter(([key, val]) => key !== "total" && val)
        .map(([key, val]) => ({
          x: key,
          y: val as number,
        })),
    },
    {
      id: "Draw",
      data: Object.entries(fixtures.draws)
        .filter(([key, val]) => key !== "total" && val)
        .map(([key, val]) => ({
          x: key,
          y: val as number,
        })),
    },
  ];

  return (
    <ResponsiveRadialBar
      data={data}
      theme={{
        text: { fill: "white", textTransform: "capitalize" },
        legends: { text: { fill: "white", textTransform: "capitalize" } },
      }}
      innerRadius={0.3}
      padding={0.2}
      margin={{ top: 10, right: 40, bottom: 50, left: 40 }}
      colors={{ scheme: "set1" }}
      radialAxisStart={{ tickSize: 10, tickPadding: 30, tickRotation: 0 }}
      enableLabels={true}
      circularAxisOuter={null}
      enableRadialGrid={false}
      enableCircularGrid={false}
      labelsSkipAngle={0}
      animate={true}
      isInteractive={false}
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          justify: false,
          translateX: 0,
          translateY: 10,
          itemWidth: 50,
          itemHeight: 10,
          itemsSpacing: 0,
          symbolSize: 12,
          itemDirection: "top-to-bottom",
        },
      ]}
    />
  );
}

function getFormColor(form: string) {
  if (form == "W") return "bg-green-400";
  if (form == "D") return "bg-slate-400";
  if (form == "L") return "bg-red-400";
}

function TournamentInformation({
  standings,
}: {
  standings: Standings["response"][0] | undefined;
}) {
  const league = standings?.league.standings[0][0];
  const form = league?.form.split("");
  return (
    <Table>
      <TableBody>
        <TableRow className="border-0">
          <TableCell className="p-3 text-start text-slate-300">מיקום</TableCell>
          <TableCell className="p-3 font-bold text-start">
            {league?.rank}
          </TableCell>
        </TableRow>
        <TableRow className="border-0">
          <TableCell className="p-3 text-start text-slate-300">
            נקודות
          </TableCell>
          <TableCell className="p-3 font-bold text-start">
            {league?.points}
          </TableCell>
        </TableRow>
        <TableRow className="border-0">
          <TableCell className="p-3 text-start text-slate-300">
            ביצועים
          </TableCell>
          <TableCell className="p-3 text-start">
            <div className="flex items-center">
              {form?.map((letter, index) => (
                <Avatar
                  key={`${index}-${letter}`}
                  className="h-[25px] w-[25px]"
                >
                  <AvatarFallback
                    className={`scale-75 ${getFormColor(letter)}`}
                  >
                    {letter}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export const StatsTable: React.FC<{
  stats: Promise<Stats[]>;
  standings: Standings;
}> = ({ stats, standings }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <Await resolve={stats}>
      {(stats: Stats[]) => {
        return (
          <div className="grid items-start w-full gap-3 grid-col-responsive cols-f">
            {stats.map((stat) => (
              <div className="flex flex-col" key={stat.response.league.name}>
                <div className="flex flex-row-reverse items-center justify-center gap-8 p-3 bg-accent text-slate-900">
                  <img
                    className="h-[50px]"
                    src={stat.response.league.logo}
                    alt={stat.response.league.name}
                  />
                  <div className="font-bold">{stat.response.league.name}</div>
                </div>
                <div className="py-3">
                  <TournamentInformation
                    standings={standings.response.find(
                      (item) => item.league.id === stat.response.league.id
                    )}
                  />
                </div>
                <div className="h-[250px]">
                  <GamesRadar fixtures={stat.response.fixtures} />
                </div>
              </div>
            ))}
          </div>
        );
      }}
    </Await>
  </Suspense>
);
