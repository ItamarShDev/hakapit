"use server";

import { LiverpoolId } from "~/server/soccer-api/constants";
import type { League } from "~/server/soccer-api/types/league";
import type { Team } from "~/server/soccer-api/types/team";
import type { TeamMatches } from "~/server/soccer-api/types/team-matches";
async function getData<T>(path: string) {
	if (!process.env.FOOTBALL_DATA_API_KEY) {
		throw new Error("FOOTBALL_DATA_API_KEY not found");
	}
	try {
		const url = `https://api.football-data.org/v4/${path}`;
		const response = await fetch(url, {
			headers: {
				"X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY,
			},
			cache: "force-cache",
		});
		const data = await response.json();
		return data as T;
	} catch (error) {
		return null;
	}
}

export async function getNextGames() {
	return await getData<TeamMatches>(`teams/${LiverpoolId}/matches?status=SCHEDULED`);
}

export async function getTeamPastMatches(id = LiverpoolId) {
	return await getData<TeamMatches>(`teams/${id}/matches?status=FINISHED&limit=5`);
}
export async function getTeam(id = LiverpoolId) {
	return await getData<Team>(`teams/${id}`);
}

export async function getLeague(league: string) {
	return await getData<League>(`competitions/${league}/standings`);
}

export async function getNextMatchData() {
	const nextGames = await getNextGames();
	const matchDetails = nextGames?.matches[0];
	return { matchDetails };
}
