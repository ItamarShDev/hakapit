import { ResponsiveBar } from "@nivo/bar";
import { useMemo } from "react";
import { LIVERPOOL_ID } from "~/api/sofascore-api/constants";
import type { getLetter, getTeamForm } from "~/components/next-match";

function getKeyByNumber(letter: ReturnType<typeof getLetter>) {
	switch (letter) {
		case "W":
			return "Win";
		case "L":
			return "Lose";
		case "D":
			return "Draw";
	}
}

export function GamesRadar({
	form,
}: {
	form: ReturnType<typeof getTeamForm>;
}) {
	const barData = useMemo(() => {
		const data = form.reduce(
			(acc, fixture) => {
				const locationKey = fixture?.homeTeam?.id === LIVERPOOL_ID ? "בית" : "חוץ";
				const typeKey = getKeyByNumber(fixture.letter);
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
		if (!data) return null;
		return [data?.Win, data?.Lose, data?.Draw];
	}, [form]);
	if (!barData) return null;
	return (
		<div className="w-auto max-w-md h-36">
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
						itemDirection: "right-to-left",
						symbolSize: 10,
						symbolSpacing: 25,
						symbolShape: "circle",
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
