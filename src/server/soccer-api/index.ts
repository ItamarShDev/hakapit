import { createServerFn } from "@tanstack/react-start";

import { getFirstMatch } from "./utils";
import { getCachedValue, setCachedValue } from "~/server/soccer-api/cache-store";
import { LIVERPOOL_TEAM_ID } from "~/server/soccer-api/constants";

import type { League } from "~/server/soccer-api/types/league";
import type { Team } from "~/server/soccer-api/types/team";
import type { TeamMatches } from "~/server/soccer-api/types/team-matches";

async function getDataCached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>) {
  const cached = await getCachedValue<T>(key);
  console.info(`Getting data for key: ${key}`);
  if (cached != null) {
    console.info(`Cache hit for key: ${key}`);
    return cached;
  }
  console.info(`Cache miss for key: ${key}`);
  const value = await fetcher();
  if (value != null) {
    await setCachedValue(key, value, ttlMs);
  }
  return value;
}

async function getData<T>(path: string) {
  const key = process.env.FOOTBALL_DATA_API_KEY || import.meta.env.VITE_FOOTBALL_DATA_API_KEY;
  if (!key) {
    throw new Error("FOOTBALL_DATA_API_KEY not found");
  }
  try {
    const url = `https://api.football-data.org/v4/${path}`;
    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": key,
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

function getNextGames() {
  return getDataCached("games-liverpool-next", 20 * 60 * 1000, () =>
    getData<TeamMatches>(`teams/${LIVERPOOL_TEAM_ID}/matches?status=SCHEDULED`),
  );
}

function getTeamPastMatches(id?: number) {
  return getDataCached(`games-${id}-past-5`, 3 * 60 * 60 * 1000, () =>
    getData<TeamMatches>(`teams/${id}/matches?status=FINISHED&limit=5`),
  );
}

async function getTeamForms(data: ReturnType<typeof getFirstMatch> | null) {
  if (!data) {
    return null;
  }
  const { awayTeam, homeTeam } = data;

  if (!awayTeam || !homeTeam) {
    return null;
  }
  const awayForm = await getTeamPastMatches(awayTeam.id);
  const homeForm = await getTeamPastMatches(homeTeam.id);

  return {
    awayForm: awayForm?.matches,
    homeForm: homeForm?.matches,
    nextGame: data,
  };
}

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

function getTeam(id: number = LIVERPOOL_TEAM_ID) {
  return getDataCached(`team-${id}`, 6 * HOUR_MS, () => getData<Team>(`teams/${id}`));
}

function getLeague(league: string) {
  return getDataCached(`league-${league}`, 2 * HOUR_MS, () => getData<League>(`competitions/${league}/standings`));
}

async function getNextMatchData() {
  const nextGames = await getNextGames();
  const matchDetails = getFirstMatch(nextGames);
  const teamForms = await getTeamForms(matchDetails);

  return { matchDetails, ...teamForms };
}

export type NextMatchData = Awaited<ReturnType<typeof getNextMatchData>>;

export const getSoccerSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  const cacheKey = "soccer-snapshot";
  const cached = await getCachedValue<{
    team: Team | null;
    leaguesData: Array<{ leagueId: string; league: League }>;
    nextMatchData: NextMatchData | null;
  }>(cacheKey);
  if (cached) {
    return cached;
  }

  const team = await getTeam();

  const leagueIds =
    team?.runningCompetitions
      ?.map((c) => c.code)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index) ?? [];

  const leagues = await Promise.all(leagueIds.map((leagueId) => getLeague(leagueId)));
  const leaguesData = leagues
    .map((league, index) => {
      const leagueId = leagueIds[index];
      if (!league || !leagueId) return null;
      return { leagueId, league };
    })
    .filter(Boolean) as Array<{ leagueId: string; league: League }>;

  const nextMatchData = await getNextMatchData();

  const snapshot = { team, leaguesData, nextMatchData };

  await setCachedValue(cacheKey, snapshot, 10 * MINUTE_MS);

  return snapshot;
});
