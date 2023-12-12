import { ResponsiveRadialBar } from "@nivo/radial-bar";
import { useMemo } from "react";
import type { Jsonify } from "type-fest";
import { LiverpoolId } from "~/api/fotmob-api/constants";
import type { TeamFixtures } from "~/api/fotmob-api/src/types/team";

type Result = { x: "home" | "away"; y: number };
type ResultType = { id: "Win" | "Lose" | "Draw"; data: Result[] };
type Results = {
  Win: ResultType;
  Lose: ResultType;
  Draw: ResultType;
};
function getKeyByNumber(number: number) {
  switch (number) {
    case 1:
      return "Win";
    case -1:
      return "Lose";
    case 0:
      return "Draw";
  }
}

export function GamesRadar({
  fixtures,
  leagueId,
}: {
  fixtures: Jsonify<TeamFixtures>;
  leagueId: number;
}) {
  const { Win, Lose, Draw } = useMemo(
    () =>
      fixtures.allFixtures.fixtures
        .filter(
          (fixture) =>
            !fixture.notStarted && fixture.tournament.leagueId === leagueId
        )
        .reduce(
          (acc, fixture) => {
            if (fixture.result == null) return acc;
            const locationKey =
              fixture.home.id === LiverpoolId ? "home" : "away";
            const typeKey = getKeyByNumber(fixture.result);
            if (!typeKey) return acc;
            const existingIDX = acc[typeKey].data.findIndex(
              (item) => item.x === locationKey
            );

            if (existingIDX > -1) {
              acc[typeKey].data[existingIDX].y += 1;
            } else {
              acc[typeKey].data.push({ x: locationKey, y: 1 });
            }
            return acc;
          },
          {
            Win: { id: "Win", data: [] },
            Lose: { id: "Lose", data: [] },
            Draw: { id: "Draw", data: [] },
          } as Results
        ),
    [fixtures, leagueId]
  );
  const data = [Win, Lose, Draw];

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
