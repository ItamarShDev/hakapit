import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/@/components/ui/table";
import { cn } from "~/@/lib/utils";
import TeamNameAndAvatar from "~/app/components/team-avatar";
import { LiverpoolId } from "~/app/providers/soccer-api/constants";
import type { League, Table as TableType } from "~/app/providers/soccer-api/types/league";

function getStandings(league: League) {
	return league.standings[0].table;
}
function getTeams(league: League) {
	const standings = getStandings(league);
	const teamStatsIndex = standings?.findIndex((stat) => stat.team.id === LiverpoolId);
	if (teamStatsIndex === -1 || teamStatsIndex === undefined) return null;

	if (teamStatsIndex === 0) {
		return [standings?.[0], standings?.[1], standings?.[2]];
	}
	if (teamStatsIndex === standings.length - 1) {
		return [standings?.[teamStatsIndex - 2], standings?.[teamStatsIndex - 1], standings?.[teamStatsIndex]];
	}
	return [standings?.[teamStatsIndex - 1], standings?.[teamStatsIndex], standings?.[teamStatsIndex + 1]];
}

export function TournamentInformation({ league }: { league: League }) {
	const teamStats = league.standings[0].table.find((t) => t.team.id === LiverpoolId);
	return (
		<Table>
			<TableBody>
				<TableRow className="border-0">
					<TableCell className="p-2 sm:p-3 text-start w-[80px] sm:w-[100px] text-slate-300 whitespace-nowrap text-xs sm:text-sm">מחזור / סבב</TableCell>
					<TableCell className="text-start p-2 sm:p-3 font-bold capitalize text-xs sm:text-sm">{league.standings[0].stage}</TableCell>
				</TableRow>
				<TableRow className="border-0">
					<TableCell className="p-2 sm:p-3 text-start w-[80px] sm:w-[100px] text-slate-300 whitespace-nowrap text-xs sm:text-sm">מיקום</TableCell>
					<TableCell className="text-start p-2 sm:p-3 font-bold text-xs sm:text-sm">{teamStats?.position}</TableCell>
				</TableRow>
				<TableRow className="border-0" hidden={teamStats?.points === undefined}>
					<TableCell className="p-2 sm:p-3 text-start w-[80px] sm:w-[100px] text-slate-300 whitespace-nowrap text-xs sm:text-sm">נקודות</TableCell>
					<TableCell className="text-start p-2 sm:p-3 font-bold text-xs sm:text-sm">{teamStats?.points}</TableCell>
				</TableRow>
				<TableRow className="border-0" hidden={teamStats?.goalDifference === undefined}>
					<TableCell className="p-2 sm:p-3 text-start w-[80px] sm:w-[100px] text-slate-300 whitespace-nowrap text-xs sm:text-sm">יחס שערים</TableCell>
					<TableCell className="text-start p-2 sm:p-3 font-bold text-xs sm:text-sm">{teamStats?.goalDifference}</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
// Remove async since this component doesn't need it
function TeamRow({ teamStats }: { teamStats: TableType }) {
	return (
		<TableRow
			className={cn(
				"border-0",
				teamStats.team.id === LiverpoolId && "bg-primary-opaque text-accent hover:bg-primary-opaque",
				teamStats.team.id === LiverpoolId && teamStats.position === 1 && "text-green-400",
			)}
		>
			<TableCell className="text-start p-1 sm:p-3 font-bold">
				<TeamNameAndAvatar hoverable team={teamStats.team} />
			</TableCell>
			<TableCell className="text-start p-1 sm:p-3 font-bold">{teamStats.position}</TableCell>
			<TableCell className="text-start p-1 sm:p-3 font-bold">{teamStats?.points}</TableCell>
			<TableCell className="text-start p-1 sm:p-3 font-bold hidden sm:table-cell">{teamStats.playedGames}</TableCell>
			<TableHead className="text-start hidden md:table-cell">
				{teamStats?.won}-{teamStats?.lost}
			</TableHead>
			<TableCell className="text-start p-1 sm:p-3 font-bold">
				{teamStats?.goalsFor}-{teamStats?.goalsAgainst}
			</TableCell>
		</TableRow>
	);
}

export function TeamTournamentInformation({ league }: { league: League }) {
	const playoffPosition = league.standings?.[0].type === "PLAYOFF";
	if (playoffPosition) return <TournamentInformation league={league} />;
	const teams = getTeams(league);
	if (!teams) return null;
	return (
		<Table className="text-xs">
			<TableHeader>
				<TableRow className="border-0">
					<TableHead className="text-start p-1 sm:p-2">קבוצה</TableHead>
					<TableHead className="text-start p-1 sm:p-2">מיקום</TableHead>
					<TableHead className="text-start p-1 sm:p-2">נקודות</TableHead>
					<TableHead className="text-start p-1 sm:p-2 hidden sm:table-cell">משחקים</TableHead>
					<TableHead className="text-start hidden md:table-cell">יחס נצחונות</TableHead>
					<TableHead className="text-start p-1 sm:p-2">יחס שערים</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{teams.map((standing) => (
					<TeamRow key={standing.team.id} teamStats={standing} />
				))}
			</TableBody>
		</Table>
	);
}
