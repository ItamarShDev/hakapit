import { ResponsiveBar } from "@nivo/bar";
import { useMemo } from "react";
import type { Jsonify } from "type-fest";
import { LiverpoolId } from "~/api/fotmob-api/constants";
import type { TeamFixtures } from "~/api/fotmob-api/src/types/team";

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
	const barData = useMemo(() => {
		const data = fixtures.allFixtures.fixtures
			.filter((fixture) => !fixture.notStarted && fixture.tournament.leagueId === leagueId)
			.reduce(
				(acc, fixture) => {
					if (fixture.result == null) return acc;
					const locationKey = fixture.home.id === LiverpoolId ? "בית" : "חוץ";
					const typeKey = getKeyByNumber(fixture.result);
					if (!typeKey) return acc;
					acc[typeKey][locationKey] += 1;
					return acc;
				},
				{
					Win: { id: "נצחון", בית: 0, חוץ: 0 },
					Lose: { id: "הפסד", בית: 0, חוץ: 0 },
					Draw: { id: "תיקו", בית: 0, חוץ: 0 },
				},
			);
		return [data.Win, data.Lose, data.Draw];
	}, [fixtures, leagueId]);

	return (
		<div className="h-36 w-[60%]">
			<ResponsiveBar
				groupMode="stacked"
				layout="horizontal"
				enableGridY={false}
				enableGridX={true}
				keys={["בית", "חוץ"]}
				indexBy={"id"}
				data={barData}
				margin={{ top: 0, right: 50, bottom: 50, left: 20 }}
				padding={0.2}
				indexScale={{ type: "band", round: true }}
				gridXValues={[]}
				axisTop={null}
				axisRight={{
					tickSize: 40,
					tickPadding: 1,
					tickRotation: 0,
					legendPosition: "middle",
					legendOffset: 0,
					truncateTickAt: 0,
				}}
				axisBottom={null}
				axisLeft={null}
				reverse={true}
				labelSkipWidth={3}
				labelSkipHeight={12}
				animate={false}
				isInteractive={false}
				legends={[
					{
						dataFrom: "keys",
						anchor: "bottom",
						direction: "row",
						justify: false,
						translateX: 0,
						translateY: 19,
						itemsSpacing: 5,
						itemWidth: 70,
						itemHeight: 10,
						itemDirection: "left-to-right",
						symbolSize: 1,
					},
				]}
				motionConfig="molasses"
				role="application"
				isFocusable={true}
				colors={{ scheme: "set1" }}
				theme={{
					text: { fill: "white", textTransform: "capitalize" },
					legends: { text: { fill: "white", textTransform: "capitalize" } },
				}}
			/>
		</div>
	);
}
