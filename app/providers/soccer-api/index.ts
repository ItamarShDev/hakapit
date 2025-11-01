"use server";

import { cacheLife, cacheTag } from "next/cache";
import { LiverpoolId } from "~/providers/soccer-api/constants";
import type { League } from "~/providers/soccer-api/types/league";
import type { Team } from "~/providers/soccer-api/types/team";
import type { TeamMatches } from "~/providers/soccer-api/types/team-matches";

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
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return data as T;
	} catch (error) {
		console.error(`Error fetching ${path}:`, error);
		return null;
	}
}

export async function getNextGames() {
	"use cache";
	cacheLife("minutes");
	cacheTag("games-liverpool");
	return await getData<TeamMatches>(`teams/${LiverpoolId}/matches?status=SCHEDULED`);
}

export async function getTeamPastMatches(id = LiverpoolId) {
	"use cache";
	cacheLife("days");
	cacheTag(`games-${id}-past`);
	return await getData<TeamMatches>(`teams/${id}/matches?status=FINISHED&limit=5`);
}

export async function getTeam(id = LiverpoolId) {
	"use cache";
	cacheLife("days");
	cacheTag(`team-${id}`);
	return await getData<Team>(`teams/${id}`);
}

export async function getLeague(league: string) {
	"use cache";
	cacheLife("hours");
	cacheTag(`league-${league}`);
	return await getData<League>(`competitions/${league}/standings`);
}

import { getFirstMatch } from "./utils";

export async function getNextMatchData() {
	const nextGames = await getNextGames();
	const matchDetails = getFirstMatch(nextGames);
	return { matchDetails };
}
