import Fotmob from "fotmob";
import { LiverpoolId } from "~/api/fotmob-api/constants";
import FotmobAPI from "~/api/fotmob-api/src/fotmob";
import type { Team } from "~/api/fotmob-api/src/types/team";

export async function getTeam() {
	const fotmob = new Fotmob();
	return (await fotmob.getTeam(8650)) as Team;
}

export function getLeague(league: number) {
	const fotmob = new FotmobAPI();
	return fotmob.getTeamSeasonStats(LiverpoolId, league);
}

export function getMatchStats(matchId: number) {
	const fotmob = new Fotmob();
	return fotmob.getMatchDetails(matchId);
}
