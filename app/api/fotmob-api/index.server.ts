import Fotmob from "fotmob";
import { LiverpoolId } from "~/api/fotmob-api/constants";

export async function getTeam(id = LiverpoolId) {
	const fotmob = new Fotmob();
	return await fotmob.getTeam(id);
}

export function getLeague(league: number) {
	const fotmob = new Fotmob();
	return fotmob.getTeamSeasonStats(LiverpoolId, league);
}

export function getMatchStats(matchId: number) {
	const fotmob = new Fotmob();
	return fotmob.getMatchDetails(matchId);
}

export function getGame<T>(gameID: number) {
	const fotmob = new Fotmob();
	return fotmob.request<T>(`matchDetails`, { matchId: `${gameID}` });
}