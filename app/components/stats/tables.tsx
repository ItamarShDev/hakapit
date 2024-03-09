import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { NextOpponentClass, OverviewTable, Team } from "fotmob/dist/esm/types/team";
import { useMemo } from "react";
import type { Jsonify } from "type-fest";
import { LiverpoolId } from "~/api/fotmob-api/constants";
import Form from "~/components/stats/form";
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

export function TournamentInformation({
	league,
	stats,
	teamData,
}: {
	league?: Jsonify<OverviewTable>;
	// biome-ignore lint:noExplicitAny: no type definition>
	stats?: Record<string, unknown> | { teams: any } | undefined;
	teamData: Jsonify<Team>;
}) {
	if (!league) return null;
	if (!stats) return null;
	const standings = useMemo(() => getLeagueInfo(league), [league]);
	const form = league.teamForm?.[LiverpoolId];
	const nextMatch = league.nextOpponent?.[LiverpoolId];
	const nextOpponentId = nextMatch?.[0] as string;
	const nextOpponent = nextMatch?.find((team) => typeof team === "object" && team.id === nextOpponentId) as
		| NextOpponentClass
		| undefined;
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
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">ממוצע שערים למשחק</TableCell>
					<TableCell className="p-3 font-bold text-start">
						{stats?.teams?.find((stat: Record<string, unknown>) => stat.name === "goals_team_match")?.participant.value}
					</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">ממוצע אחזקת כדור</TableCell>
					<TableCell className="p-3 font-bold text-start">
						{
							stats?.teams?.find((stat: Record<string, unknown>) => stat.name === "possession_percentage_team")
								?.participant.value
						}
					</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">xG</TableCell>
					<TableCell className="p-3 font-bold text-start">
						{
							stats?.teams?.find((stat: Record<string, unknown>) => stat.name === "expected_goals_team")?.participant
								.value
						}
					</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">נקודות</TableCell>
					<TableCell className="p-3 font-bold text-start">{standings?.pts}</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">ביצועים</TableCell>
					<TableCell className="p-3 text-start">
						<div className="flex items-center">{form && <Form form={form} />}</div>
					</TableCell>
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
