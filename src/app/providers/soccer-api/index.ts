import { createServerFn } from "@tanstack/react-start";
import {
  getCachedValue,
  setCachedValue,
} from "~/app/providers/soccer-api/cacheStore";
import { LiverpoolId } from "~/app/providers/soccer-api/constants";
import type { League } from "~/app/providers/soccer-api/types/league";
import type { Team } from "~/app/providers/soccer-api/types/team";
import type { TeamMatches } from "~/app/providers/soccer-api/types/team-matches";
import { getFirstMatch } from "./utils";

async function getDataCached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
) {
  const cached = await getCachedValue<T>(key);
  console.info(`Getting data for key: ${key}`);
  if (cached != null) {
    console.info(`Cache hit for key: ${key}=${JSON.stringify(cached)}`);
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
  const key =
    process.env.FOOTBALL_DATA_API_KEY ||
    import.meta.env.VITE_FOOTBALL_DATA_API_KEY;
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
  return getDataCached("games-liverpool-next", 10 * 60 * 1000, () =>
    getData<TeamMatches>(`teams/${LiverpoolId}/matches?status=SCHEDULED`),
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

export const getTeam = createServerFn({ method: "GET" })
  .inputValidator((id?: number) => id ?? LiverpoolId)
  .handler(async ({ data: id }) => {
    return await getDataCached(`team-${id}`, 3 * 60 * 60 * 1000, () =>
      getData<Team>(`teams/${id}`),
    );
  });

export const getLeague = createServerFn({ method: "GET" })
  .inputValidator((league: string) => league)
  .handler(async ({ data: league }) => {
    return await getDataCached(`league-${league}`, 10 * 60 * 1000, () =>
      getData<League>(`competitions/${league}/standings`),
    );
  });

export const getNextMatchData = createServerFn({ method: "GET" }).handler(
  async () => {
    const nextGames = await getNextGames();
    const matchDetails = getFirstMatch(nextGames);
    const teamForms = await getTeamForms(matchDetails);

    return { matchDetails, ...teamForms };
  },
);

export type NextMatchData = Awaited<ReturnType<typeof getNextMatchData>>;
