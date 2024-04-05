import type { Jsonify } from "type-fest";
import { BASE_URL, LIVERPOOL_ID } from "~/api/sofascore-api/constants";
import type { LeagueForm } from "~/api/sofascore-api/types/forms";
import type { Head2Head } from "~/api/sofascore-api/types/h2h";
import type { GameEvent, NextGame as NextGames } from "~/api/sofascore-api/types/next-game";
import type { Seasons } from "~/api/sofascore-api/types/seasons";
import type { Standings } from "~/api/sofascore-api/types/standings";
import type { SeasonStatistics } from "~/api/sofascore-api/types/statistics";
import type { TeamLeagues } from "~/api/sofascore-api/types/team-leagues";

async function getForm(tournamentId?: number, seasonId?: number, page = 0) {
	const url = `${BASE_URL}/unique-tournament/${tournamentId}/season/${seasonId}/events/all/${page}`;
	const response = await fetch(url);
	return (await response.json()) as LeagueForm;
}

async function getForms(tournamentId: number, seasonId: number, page = 0, totalForm?: LeagueForm) {
	const form = await getForm(tournamentId, seasonId, page);
	form.events = [...(totalForm?.events || []), ...(form.events || [])].toSorted(
		(a, b) => a.startTimestamp - b.startTimestamp,
	);
	if (form.hasNextPage) {
		return getForms(tournamentId, seasonId, page + 1, form);
	}
	return form;
}

export async function getLeague(tournamentId?: number, seasonId?: number) {
	const url = `${BASE_URL}/tournament/${tournamentId}/season/${seasonId}/standings/total`;
	const response = await fetch(url);
	return (await response.json()) as Standings;
}

export async function getTeamLeagues(teamId = LIVERPOOL_ID) {
	const url = `${BASE_URL}/team/${teamId}/standings/seasons`;
	const response = await fetch(url);
	const leagues = (await response.json()) as TeamLeagues;
	const promises = leagues.tournamentSeasons.filter((league) =>
		league.seasons.some((season) => season.year === "23/24"),
	);
	return (await Promise.all(
		promises.map((league) => getLeague(league.tournament.id, league.seasons[0].id)),
	)) as Standings[];
}

export async function getTeamNextGames(teamId = LIVERPOOL_ID) {
	const url = `${BASE_URL}/team/${teamId}/events/next/0`;
	const response = await fetch(url);
	return (await response.json()) as NextGames;
}

export function getTeamNextGame(nextGames: NextGames, leagueId?: number, seasonId?: number) {
	if (seasonId) {
		const game = nextGames.events.find(
			(e) => e.season.id === seasonId && e.status.code !== 60,
		) as NextGames["events"][0];
		if (game) {
			return game;
		}
	}
	if (leagueId) {
		return nextGames.events.find((e) => e.tournament.id === leagueId && e.status.code !== 60) as NextGames["events"][0];
	}
	return nextGames.events.find((e) => e.status.code !== 60) as NextGames["events"][0];
}

async function getH2H(gameId: string) {
	const url = `${BASE_URL}/event/${gameId}/h2h/events`;
	const response = await fetch(url);
	return (await response.json()) as Head2Head;
}
export async function getLeagueStatistics(tournamentId: number, seasonId: number | undefined) {
	const url = `${BASE_URL}/team/${LIVERPOOL_ID}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/overall`;
	const response = await fetch(url);
	return (await response.json()) as SeasonStatistics;
}

export async function getNextMatchData() {
	const nextGames = await getTeamNextGames();
	const nextMatch = getTeamNextGame(nextGames);
	const h2h = await getH2H(nextMatch.customId);
	const form = await getForms(nextMatch.tournament.uniqueTournament.id, nextMatch.season.id);
	return { nextMatch, form, h2h } as const;
}
export async function getSeasonId(tournamentId: number) {
	const url = `${BASE_URL}/team/${LIVERPOOL_ID}/team-statistics/seasons`;
	const response = await fetch(url);
	const res = (await response.json()) as Seasons;
	const seasons = res.uniqueTournamentSeasons.find((season) => season.uniqueTournament.id === tournamentId);
	return seasons?.seasons[0].id;
}

export async function getTeamLeaguesAndStats() {
	const leagues = await getTeamLeagues();
	const forms = {} as Record<string, { form: LeagueForm; nextMatch: GameEvent; stats: SeasonStatistics }>;
	const nextGames = await getTeamNextGames();
	for (const league of leagues) {
		const leagueId = league?.standings[0].tournament.id;
		const tournamentId = league?.standings[0].tournament.uniqueTournament.id;
		const seasonId = await getSeasonId(tournamentId);
		const nextMatch = getTeamNextGame(nextGames, leagueId, seasonId);
		const stats = await getLeagueStatistics(tournamentId, seasonId);
		const form = await getForms(tournamentId, seasonId ?? leagueId);
		forms[leagueId] = { form, nextMatch, stats };
	}
	return { leagues, leagueStats: forms };
}
export type LeagueStats = ReturnType<typeof getTeamLeaguesAndStats> extends Promise<infer T> ? Jsonify<T> : never;
