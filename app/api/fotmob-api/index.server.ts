import Fotmob from "fotmob";
import { LiverpoolId } from "~/api/fotmob-api/constants";

export async function getTeam() {
	const fotmob = new Fotmob();
	return await fotmob.getTeam(8650);
}

export function getLeague(league: number) {
	const fotmob = new Fotmob();
	return fotmob.getTeamSeasonStats(LiverpoolId, league);
}

export function getMatchStats(matchId: number) {
	const fotmob = new Fotmob();
	return fotmob.getMatchDetails(matchId);
}
