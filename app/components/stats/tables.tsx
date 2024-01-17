import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { Jsonify } from "type-fest";
import { LiverpoolId } from "~/api/fotmob-api/constants";
import type { NextOpponentClass, Team } from "~/api/fotmob-api/src/types/team";
import { ResultTooltip, getFormColor } from "~/components/stats/form";
import { GamesRadar } from "~/components/stats/radar";
import TeamAvatar from "~/components/team-avatar";

function getLeagueInfo(league: Jsonify<Team["table"][0]>) {
	if (league.data.tables) {
		return league.data.tables
			.map((table) => table.table.all.find((team) => team.id === LiverpoolId))
			.filter((team) => team)[0];
	}
	return league.data.table?.all.find((team) => team.id === LiverpoolId);
}

export function TournamentInformation({
	league,
	stats,
	teamData,
}: {
	league?: Jsonify<Team["table"][0]>;
	// biome-ignore lint:noExplicitAny: no type definition>
	stats?: Record<string, unknown> | { teams: any } | undefined;
	teamData: Jsonify<Team>;
}) {
	if (!league) return null;
	const standings = getLeagueInfo(league);
	const form = league.teamForm[LiverpoolId];
	const nextMatch = league.nextOpponent?.[LiverpoolId];
	const nextOpponentId = nextMatch?.[0] as string;
	const nextOpponent = nextMatch?.find((team) => typeof team === "object" && team.id === nextOpponentId) as
		| NextOpponentClass
		| undefined;

	return (
		<Table>
			<TableBody>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300">מיקום</TableCell>
					<TableCell className="p-3 font-bold text-start">{standings?.idx}</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300">נקודות</TableCell>
					<TableCell className="p-3 font-bold text-start">{standings?.pts}</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300">ממוצע שערים למשחק</TableCell>
					<TableCell className="p-3 font-bold text-start">
						{stats?.teams.find((stat: Record<string, unknown>) => stat.name === "goals_team_match")?.participant.value}
					</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300">ממוצע אחזקת כדור</TableCell>
					<TableCell className="p-3 font-bold text-start">
						{
							stats?.teams.find((stat: Record<string, unknown>) => stat.name === "possession_percentage_team")
								?.participant.value
						}
					</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300">xG</TableCell>
					<TableCell className="p-3 font-bold text-start">
						{
							stats?.teams.find((stat: Record<string, unknown>) => stat.name === "expected_goals_team")?.participant
								.value
						}
					</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300">נקודות</TableCell>
					<TableCell className="p-3 font-bold text-start">{standings?.pts}</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300">ביצועים</TableCell>
					<TableCell className="p-3 text-start">
						<div className="flex items-center">
							{form?.map((game) => (
								<ResultTooltip game={game} key={game.linkToMatch}>
									<Avatar className="h-[25px] w-[25px]">
										<AvatarFallback className={`scale-75 ${getFormColor(game.resultString)}`}>
											{game.resultString}
										</AvatarFallback>
									</Avatar>
								</ResultTooltip>
							))}
						</div>
					</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300">משחק הבא</TableCell>
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
					<TableCell className="p-3 text-start text-slate-300">תוצאות עד כה</TableCell>
					<TableCell className="p-3 font-bold text-start">
						<GamesRadar fixtures={teamData.fixtures} leagueId={league.data.leagueId} />
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
