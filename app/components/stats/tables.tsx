import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { LIVERPOOL_ID } from "~/api/sofascore-api/constants";
import type { LeagueStats } from "~/api/sofascore-api/index.server";
import { getTeamForm } from "~/components/next-match";
import { TeamForm } from "~/components/stats/form";
import { GamesRadar } from "~/components/stats/radar";
import TeamAvatar from "~/components/team-avatar";

function getNextOpponent(leagueStats: LeagueStats["leagueStats"], leagueId: number) {
	const nextMatch = leagueStats[leagueId].nextMatch;
	if (!nextMatch) return null;
	if (nextMatch.awayTeam.id === LIVERPOOL_ID) {
		return nextMatch.homeTeam;
	}
	return nextMatch.awayTeam;
}

type TableProps = { leaguesData: LeagueStats; index: number };

export function TournamentInformation({ leaguesData, index }: TableProps) {
	const { leagueStats } = leaguesData;
	const league = leaguesData.leagues[index];
	const leagueId = league?.standings[0].tournament.id;
	const nextOpponent = getNextOpponent(leagueStats, leagueId);
	const standings = league.standings[0].rows.find((team) => team.team.id === LIVERPOOL_ID);
	const form = getTeamForm(leagueStats[leagueId].form, LIVERPOOL_ID);
	const stats = leagueStats[leagueId].stats;

	if (!standings || !stats) return null;

	return (
		<Table>
			<TableBody>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">מחזור</TableCell>
					<TableCell className="p-3 font-bold text-start">{standings.matches}</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">מיקום</TableCell>
					<TableCell className="p-3 font-bold text-start">{standings.position}</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">נקודות</TableCell>
					<TableCell className="p-3 font-bold text-start">{standings.points}</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">הפרשי שערים</TableCell>
					<TableCell className="p-3 font-bold text-start">
						{stats.statistics.goalsScored - stats.statistics.goalsConceded}
					</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">ממוצע שערים למשחק</TableCell>
					<TableCell className="p-3 font-bold text-start">
						{(standings.scoresFor / standings.matches).toFixed(2)}
					</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">ממוצע אחזקת כדור</TableCell>
					<TableCell className="p-3 font-bold text-start">
						{stats.statistics.averageBallPossession.toFixed(2)}%
					</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">ביצועים</TableCell>
					<TableCell className="p-3 text-start">
						<div className="flex items-center">{form && <TeamForm form={form.slice(0, 5)} />}</div>
					</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">משחק הבא</TableCell>
					<TableCell className="p-3 font-bold text-start">
						{nextOpponent && (
							<TeamAvatar
								teamId={nextOpponent?.id}
								teamName={nextOpponent?.name}
								teamShortName={nextOpponent?.shortName}
							/>
						)}
					</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-3 text-start text-slate-300 whitespace-nowrap">תוצאות עד כה</TableCell>
					<TableCell className="p-3 font-bold text-start">
						<GamesRadar form={form} />
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
