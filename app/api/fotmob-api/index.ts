import Fotmob from "fotmob";
import { LiverpoolId } from "~/api/fotmob-api/constants";

export async function getTeam(id = LiverpoolId) {
	const fotmob = new Fotmob();
	return await fotmob.getTeam(id);
}

export function getLeague(league: number) {
	const fotmob = new Fotmob();
	return fotmob.getLeague(league);
}

export function getLeagueStats(league: number, teamId = LiverpoolId) {
	const fotmob = new Fotmob();
	return fotmob.getTeamSeasonStats(teamId, league);
}

export async function getLeagues(leagueId: string | number) {
	const leagueID = Number.parseInt(`${leagueId}`);
	const leagueStats = await getLeagueStats(leagueID);	
	const leaguesToFetch = leagueStats?.tournamentSeasons
		?.filter((t) => t.season?.includes(`${new Date().getFullYear()}`))
		.map((tournament) => tournament.parentLeagueId && Number.parseInt(tournament.parentLeagueId));
	return await Promise.all(leaguesToFetch?.map((league) => league && getLeague(league)) || []);
}