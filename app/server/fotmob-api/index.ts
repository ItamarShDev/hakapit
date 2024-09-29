"use server";

import Fotmob from "fotmob";
import { LiverpoolId } from "~/server/fotmob-api/constants";
const fotmob = new Fotmob();

export async function getTeam(id = LiverpoolId) {
	return await fotmob.getTeam(id);
}

export async function getLeague(league: number) {
	return await fotmob.getLeague(league);
}

export async function getLeagueStats(league: number, teamId = LiverpoolId) {
	return await fotmob.getTeamSeasonStats(teamId, league);
}

export async function getLeagues(leagueId: string | number) {
	const leagueID = Number.parseInt(`${leagueId}`);
	const leagueStats = await getLeagueStats(leagueID);
	const leaguesToFetch = (leagueStats?.tournamentSeasons || [])
		.filter((t) => t.season?.startsWith(`${new Date().getFullYear()}`) && t.parentLeagueId)
		.map((tournament) => tournament.parentLeagueId);
	return leaguesToFetch;
}
export async function getMatchDetails(matchId?: number) {
	if (!matchId) return null;
	return await fotmob.getMatchDetails(matchId);
}

export async function getNextMatchData() {
	const teamData = await getTeam();
	const nextGame = teamData?.overview?.nextMatch;
	const matchDetails = await getMatchDetails(nextGame?.id);
	const nextMatchOpponent = await getTeam(nextGame?.opponent?.id);
	return { teamData, nextMatchOpponent, matchDetails };
}
