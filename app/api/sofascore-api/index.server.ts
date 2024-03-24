import { BASE_URL, LIVERPOOL_ID } from "~/api/sofascore-api/constants";
import type { LeagueForm } from "~/api/sofascore-api/types/forms";
import type { NextGame } from "~/api/sofascore-api/types/next-game";

export function getTeamData(teamId = LIVERPOOL_ID) {}

async function getForm(tournamentId?: number, seasonId?: number, page = 0) {
	const url = `${BASE_URL}/unique-tournament/${tournamentId}/season/${seasonId}/events/all/${page}`;
	const response = await fetch(url);
	return (await response.json()) as LeagueForm;
}
async function fetchForms(tournamentId: number, seasonId: number, page = 0, totalForm?: LeagueForm) {
	const form = await getForm(tournamentId, seasonId, page);
	form.events = [...(totalForm?.events || []), ...form.events].toSorted((a, b) => a.startTimestamp - b.startTimestamp);
	if (form.hasNextPage) {
		return fetchForms(tournamentId, seasonId, page + 1, form);
	}
	return form;
}
export async function getForms(tournamentId: number, seasonId: number) {
	return await fetchForms(tournamentId, seasonId);
}

export async function getLeague(tournamentId?: number, seasonId?: number) {
	const url = `${BASE_URL}/tournament/${tournamentId}/season/${seasonId}/standings/total`;
	const response = await fetch(url);
	return await response.json();
}

export async function geTeamLeagues(teamId = LIVERPOOL_ID) {
	const url = `${BASE_URL}/team/${teamId}/standings/seasons`;
	const response = await fetch(url);
	return await response.json();
}

export async function getTeamNextGame(teamId = LIVERPOOL_ID) {
	const url = `${BASE_URL}/team/${teamId}/events/next/0`;
	const response = await fetch(url);
	const data = (await response.json()) as NextGame;

	return data.events.find((e) => e.status.code !== 60) as NextGame["events"][0];
}
// export function getMatchStats(matchId: number) {
// 	return fotmob.getMatchDetails(matchId);
// }

// export function getGame<T>(gameID: number) {
// 	return fotmob.request<T>(`matchDetails`, { matchId: `${gameID}` });
// }

export async function getNextMatchData() {
	const nextMatch = await getTeamNextGame();
	// const nextSeason = await getLeague(nextMatch?.tournament?.id, nextMatch?.season?.id);
	const form = await getForms(nextMatch.tournament.uniqueTournament.id, nextMatch.season.id);
	return { nextMatch, form } as const;
}
