import Fotmob from "fotmob";
import { LiverpoolId } from "~/server/fotmob-api/constants";

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
	const leaguesToFetch = [];
	for (const season of leagueStats?.tournamentSeasons || []) {
		if (season.season?.includes(`${new Date().getFullYear()}`) && season.parentLeagueId) {
			leaguesToFetch.push(season.parentLeagueId);
		}
	}
	return leaguesToFetch;
}
