import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { NextOpponentClass, OverviewTable, Team } from "fotmob/dist/esm/types/team";
import { useMemo } from "react";
import type { Jsonify } from "type-fest";
import { LiverpoolId } from "~/api/fotmob-api/constants";
import { GamesRadar } from "~/components/stats/radar";
import TeamAvatar from "~/components/team-avatar";

function getLeagueInfo(league: Jsonify<OverviewTable>) {
	if (league?.data?.tables) {
		return league?.data?.tables
			.map((table) => table?.table?.all?.find((team) => team.id === LiverpoolId))
			.filter((team) => team)[0];
	}
	return league?.data?.table?.all?.find((team) => team.id === LiverpoolId);
}
function roundToDecimal(number: number) {
	return Math.round(number * 10) / 10;
}
export function TournamentInformation({
	league,
	teamData,
}: {
	league?: Jsonify<OverviewTable>;
	teamData: Jsonify<Team>;
}) {
	if (!league) return null;
	const standings = useMemo(() => getLeagueInfo(league), [league]);
	const nextMatch = league.nextOpponent?.[LiverpoolId];
	const nextOpponentId = nextMatch?.[0] as string;
	const nextOpponent = nextMatch?.find((team) => typeof team === "object" && team.id === nextOpponentId) as
		| NextOpponentClass
		| undefined;
	const teamStats = league.data?.table?.all?.find((stat: Record<string, unknown>) => stat.id === LiverpoolId);
	// @ts-ignore
	const teamXg = league.data?.table?.xg?.find((stat: Record<string, unknown>) => stat.id === LiverpoolId);

	return (
		<Table>
			<TableBody>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">מיקום</TableCell>
					<TableCell className="p-3 font-bold text-start">{standings?.idx}</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">נקודות</TableCell>
					<TableCell className="p-3 font-bold text-start">{standings?.pts}</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">יחס שערים</TableCell>
					<TableCell className="p-3 font-bold text-start">{teamStats?.scoresStr}</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">ממוצע אחזקת כדור</TableCell>
					<TableCell className="p-3 font-bold text-start">
						{
							teamData?.stats?.teams?.find(
								(stat: Record<string, unknown>) => stat.stat === "possession_percentage_team",
							)?.participant?.value
						}
					</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">xG למשחק</TableCell>
					<TableCell className="p-3 font-bold text-start">{roundToDecimal(teamXg.xgDiff)}</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">xG</TableCell>
					<TableCell className="p-3 font-bold text-start">{roundToDecimal(teamXg.xg)}</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">משחק הבא</TableCell>
					<TableCell className="p-3 font-bold text-start">
						{nextOpponent && (
							<TeamAvatar
								teamId={nextOpponentId}
								teamName={nextOpponent?.name}
								teamShortName={nextOpponent?.shortName}
							/>
						)}
					</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">תוצאות עד כה</TableCell>
					<TableCell className="p-3 font-bold text-start">
						{teamData.fixtures && league.data?.leagueId && (
							<GamesRadar fixtures={teamData.fixtures} leagueId={league.data.leagueId} />
						)}
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
