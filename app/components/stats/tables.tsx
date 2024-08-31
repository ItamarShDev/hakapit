import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { All, DataTable, League, TableElement } from "fotmob/dist/esm/types/league";
import type { NextOpponentClass } from "fotmob/dist/esm/types/team";
import { GamesStatsChart } from "~/components/stats/radar";
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

function getTeams(league: League) {
	const standings = getStandings(league);
	if (!standings?.all) return null;
	const teamStatsIndex = standings?.all?.findIndex((stat) => stat.id === LiverpoolId);
	if (teamStatsIndex === -1 || teamStatsIndex === undefined) return null;

	if (teamStatsIndex === 0) {
		return [standings.all?.[0], standings.all?.[1], standings.all?.[2]];
	}
	if (teamStatsIndex === standings.all?.length - 1) {
		return [standings.all?.[teamStatsIndex - 2], standings.all?.[teamStatsIndex - 1], standings.all?.[teamStatsIndex]];
	}
	return [standings.all?.[teamStatsIndex - 1], standings.all?.[teamStatsIndex], standings.all?.[teamStatsIndex + 1]];
}

export function TournamentInformation({
	league,
}: {
	league: League;
}) {
	const table = league?.table?.[0];
	const standings = getStandings(league);
	const position = getPlayoffPosition(league);
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
								</div>
							) : (
								"אין משחק הבא"
							)}
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
			<GamesStatsChart fixtures={league.matches} />
		</>
	);
}
function TeamRow({ teamStats, table }: { teamStats: Required<All>; table: TableElement }) {
	const nextMatch = table?.nextOpponent?.[teamStats.id];

	const nextOpponentId = nextMatch?.[0] as string;
	const nextOpponent = nextMatch?.find((team) => typeof team === "object" && team.id === nextOpponentId) as
		| NextOpponentClass
		| undefined;
	// @ts-ignore
	const teamXg = table.data?.table?.xg?.find((stat: Record<string, unknown>) => stat.id === teamStats.id);
	return (
		<TableRow
			className={cn(
				"border-0",
				teamStats.id === LiverpoolId && "bg-primary-opaque text-accent hover:bg-primary-opaque",
				teamStats.id === LiverpoolId && teamStats.idx === 1 && "text-green-400",
			)}
		>
			<TableCell className="text-start p-3 font-bold">
				<TeamAvatar
					hoverable
					teamId={teamStats.id}
					teamName={teamStats?.name}
					teamShortName={nextOpponent?.shortName}
				/>
			</TableCell>
			<TableCell className="text-start p-3 font-bold">{teamStats.idx}</TableCell>
			<TableCell className="text-start p-3 font-bold">{teamStats?.pts}</TableCell>
			<TableHead className="text-start hidden md:table-cell">{teamStats?.wins}</TableHead>
			<TableHead className="text-start hidden md:table-cell">{teamStats?.losses}</TableHead>
			<TableCell className="text-start p-3 font-bold">{teamStats?.scoresStr}</TableCell>

			<TableCell className="text-end ltr p-3 font-bold">{teamXg && roundToDecimal(teamXg.xg)}</TableCell>
			<TableCell className="text-start p-3 font-bold">
				{nextOpponent ? (
					<div className="flex items-center gap-2">
						<TeamAvatar
							hoverable
							teamId={nextOpponentId}
							teamName={nextOpponent?.name}
							teamShortName={nextOpponent?.shortName}
						/>
					</div>
				) : (
					"אין משחק הבא"
				)}
			</TableCell>
		</TableRow>
	);
}

export function TeamTournamentInformation({
	league,
}: {
	league: League;
}) {
	const table = league?.table?.[0];
	if (!table) return null;
	const playoffPosition = getPlayoffPosition(league);
	if (playoffPosition) return <TournamentInformation league={league} />;
	const teams = getTeams(league);
	if (!teams) return null;
	return (
		<>
			<Table className="text-xs">
				<TableHeader>
					<TableRow className="border-0">
						<TableHead className="text-start">קבוצה</TableHead>
						<TableHead className="text-start">מיקום</TableHead>
						<TableHead className="text-start">נקודות</TableHead>
						<TableHead className="text-start hidden md:table-cell">נצחונות</TableHead>
						<TableHead className="text-start hidden md:table-cell">הפסדים</TableHead>
						<TableHead className="text-start">יחס שערים</TableHead>
						<TableHead className="text-start">xG</TableHead>
						<TableHead className="text-start">משחק הבא</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{teams.map((team) => (
						<TeamRow key={team.id} teamStats={team as Required<All>} table={table} />
					))}
				</TableBody>
			</Table>
		</>
	);
}
