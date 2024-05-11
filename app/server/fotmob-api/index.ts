"use server";

import Fotmob from "fotmob";
import { LiverpoolId } from "~/server/fotmob-api/constants";

export async function getTeam(id = LiverpoolId) {
	const fotmob = new Fotmob();
	return await fotmob.getTeam(id);
}

export async function getLeague(league: number) {
	const fotmob = new Fotmob();
	return await fotmob.getLeague(league);
}

export async function getLeagueStats(league: number, teamId = LiverpoolId) {
	const fotmob = new Fotmob();
	return await fotmob.getTeamSeasonStats(teamId, league);
}

export async function getLeagues(leagueId: string | number) {
	const leagueID = Number.parseInt(`${leagueId}`);
	const leagueStats = await getLeagueStats(leagueID);
	const leaguesToFetch = (leagueStats?.tournamentSeasons || [])
		.filter((t) => t.season?.includes(`${new Date().getFullYear()}`) && t.parentLeagueId)
		.map((tournament) => tournament.parentLeagueId);
	return leaguesToFetch;
}
export async function getNextMatchData() {
	const teamData = await getTeam();
	const nextGame = teamData?.overview?.nextMatch;
	const nextMatchOpponent = await getTeam(nextGame?.opponent?.id);
	return { teamData, nextMatchOpponent };
}
