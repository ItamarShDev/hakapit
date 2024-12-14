"use server";

import { LiverpoolId } from "~/server/soccer-api/constants";
import type { League } from "~/server/soccer-api/types/league";
import type { Team } from "~/server/soccer-api/types/team";
import type { TeamMatches } from "~/server/soccer-api/types/team-matches";

async function getData<T>(path: string, revalidate = 300) {
    if (!process.env.FOOTBALL_DATA_API_KEY) {
        throw new Error("FOOTBALL_DATA_API_KEY not found");
    }
    try {
        const url = `https://api.football-data.org/v4/${path}`;
        const response = await fetch(url, {
            headers: {
                "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY,
            },
            next: { revalidate }, // Use Next.js 13+ revalidation
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data as T;
    } catch (error) {
        console.error(`Error fetching ${path}:`, error);
        return null;
    }
}

export async function getNextGames(revalidate = 60) { // More frequent updates for next games
    return await getData<TeamMatches>(`teams/${LiverpoolId}/matches?status=SCHEDULED`, revalidate);
}

export async function getTeamPastMatches(id = LiverpoolId, revalidate = 300) {
    return await getData<TeamMatches>(`teams/${id}/matches?status=FINISHED&limit=5`, revalidate);
}

export async function getTeam(id = LiverpoolId, revalidate = 3600) { // Cache team data for longer
    return await getData<Team>(`teams/${id}`, revalidate);
}

export async function getLeague(league: string, revalidate = 300) {
    return await getData<League>(`competitions/${league}/standings`, revalidate);
}

export async function getNextMatchData(revalidate = 60) {
    const nextGames = await getNextGames(revalidate);
    const matchDetails = nextGames?.matches[0];
    return { matchDetails };
}
