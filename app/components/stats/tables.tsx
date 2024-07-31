import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { DataTable, League } from "fotmob/dist/esm/types/league";
import type { NextOpponentClass } from "fotmob/dist/esm/types/team";
import { GamesRadar } from "~/components/stats/radar";
import TeamAvatar from "~/components/team-avatar";
import { LiverpoolId } from "~/server/fotmob-api/constants";

function getStandings(league: League) {
	if (league.table !== undefined) {
		const table = league?.table?.[0].data;
		if (!table) return null;
		if ("tables" in table) {
			// @ts-ignore
			for (const ttable of table.tables) {
				if ((ttable?.table as DataTable)?.all?.find((team) => team.id === LiverpoolId)) {
					return ttable.table as DataTable;
				}
			}
		}
		return table.table as DataTable;
	}
}

function roundToDecimal(number: number) {
	return Math.round(number * 10) / 10;
}

function getPlayoffPosition(league: League) {
	const playoff = league.playoff;
	if (!playoff) return null;
	// @ts-ignore
	for (const round of playoff.rounds.toReversed()) {
		const game = round.matchups.find(
			// @ts-ignore
			(matchup) => matchup.homeTeamId === LiverpoolId || matchup.awayTeamId === LiverpoolId,
		);
		if (game) {
			if (game.winner === LiverpoolId && game.stage === "final") return "Winner";
			return game.stage;
		}
	}
}
function getPosition(league: League) {
	const playoffPosition = getPlayoffPosition(league);
	if (playoffPosition) return playoffPosition;
	const standings = getStandings(league);

	const teamStats = standings?.all?.find((stat) => stat.id === LiverpoolId);
	return teamStats?.idx;
}

export function TournamentInformation({
	league,
}: {
	league: League;
}) {
	const table = league?.table?.[0];
	const standings = getStandings(league);
	const position = getPosition(league);
	const round = position === "Winner" ? "Final" : league.matches?.firstUnplayedMatch?.firstRoundWithUnplayedMatch;
	const nextMatch = table?.nextOpponent?.[LiverpoolId];

	const nextGame = league.matches?.allMatches?.find((m) => m.id === nextMatch?.[2]);
	const nextOpponentId = nextMatch?.[0] as string;
	const nextOpponent = nextMatch?.find((team) => typeof team === "object" && team.id === nextOpponentId) as
		| NextOpponentClass
		| undefined;
	const teamStats = standings?.all?.find((stat) => stat.id === LiverpoolId);
	// @ts-ignore
	const teamXg = standings?.xg?.find((stat: Record<string, unknown>) => stat.id === LiverpoolId);
	return (
		<>
			<Table>
				<TableBody>
					<TableRow className="border-0">
						<TableCell className="p-3 text-start w-[100px] text-slate-300 whitespace-nowrap">מחזור / סבב</TableCell>
						<TableCell className="text-start p-3 font-bold capitalize">{round}</TableCell>
					</TableRow>
					<TableRow className="border-0">
						<TableCell className="p-3 text-start w-[100px] text-slate-300 whitespace-nowrap">מיקום</TableCell>
						<TableCell className="text-start p-3 font-bold">{position}</TableCell>
					</TableRow>
					<TableRow className="border-0" hidden={teamStats?.pts === undefined}>
						<TableCell className="p-3 text-start w-[100px] text-slate-300 whitespace-nowrap">נקודות</TableCell>
						<TableCell className="text-start p-3 font-bold">{teamStats?.pts}</TableCell>
					</TableRow>
					<TableRow className="border-0" hidden={teamStats?.scoresStr === undefined}>
						<TableCell className="p-3 text-start w-[100px] text-slate-300 whitespace-nowrap">יחס שערים</TableCell>
						<TableCell className="text-start p-3 font-bold">{teamStats?.scoresStr}</TableCell>
					</TableRow>

					<TableRow className="border-0" hidden={teamXg === undefined}>
						<TableCell className="p-3 text-start w-[100px] text-slate-300 whitespace-nowrap ">xG למשחק</TableCell>
						<TableCell className="text-end ltr p-3 font-bold">{teamXg && roundToDecimal(teamXg.xgDiff)}</TableCell>
					</TableRow>
					<TableRow className="border-0" hidden={teamXg === undefined}>
						<TableCell className="p-3 text-start w-[100px] text-slate-300 whitespace-nowrap">xG</TableCell>
						<TableCell className="text-end ltr p-3 font-bold">{teamXg && roundToDecimal(teamXg.xg)}</TableCell>
					</TableRow>
					<TableRow className="border-0">
						<TableCell className="p-3 text-start w-[100px] text-slate-300 whitespace-nowrap">משחק הבא</TableCell>
						<TableCell className="text-start p-3 font-bold">
							{nextOpponent ? (
								<div className="flex items-center gap-2">
									<TeamAvatar
										teamId={nextOpponentId}
										teamName={nextOpponent?.name}
										teamShortName={nextOpponent?.shortName}
									/>
									<div className="text-balance text-xs text-gray-400">
										({nextGame?.status?.utcTime && new Date(nextGame.status.utcTime).toLocaleString()})
									</div>
								</div>
							) : (
								"אין משחק הבא"
							)}
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
			<GamesRadar fixtures={league.matches} />
		</>
	);
}
