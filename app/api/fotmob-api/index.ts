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

export function getLeagues(teamId = LiverpoolId) {
	const fotmob = new Fotmob();
	return fotmob.getAllLeagues();
}

