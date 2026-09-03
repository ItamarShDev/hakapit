import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action, internalMutation, query } from "./_generated/server";
import { readCachedJson, upsertCacheEntry } from "./cache";

const FOOTBALL_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const LIVERPOOL_ID = 64;

async function fetchFootball<T>(path: string) {
  if (!FOOTBALL_API_KEY) {
    throw new Error("FOOTBALL_DATA_API_KEY missing in Convex environment");
  }
  const res = await fetch(`https://api.football-data.org/v4/${path}`, {
    headers: { "X-Auth-Token": FOOTBALL_API_KEY },
  });
  if (!res.ok) {
    throw new Error(`football-data error ${res.status} for ${path}`);
  }
  return (await res.json()) as T;
}

type StandingLeague = {
  competition?: { id?: number; code?: string; name?: string; emblem?: string };
  standings?: unknown[];
};

type TeamResponse = {
  id?: number;
  name?: string;
  shortName?: string;
  crest?: string;
  runningCompetitions?: Array<{ code?: string }>;
};

type MatchTeam = { id?: number; name?: string; shortName?: string; crest?: string };
type MatchScore = { fullTime?: { home?: number; away?: number } };
type Match = {
  id?: number;
  competition?: { id?: number; code?: string; name?: string; emblem?: string };
  homeTeam?: MatchTeam;
  awayTeam?: MatchTeam;
  score?: MatchScore;
  status?: string;
  utcDate?: string;
};

type MatchesResponse = { matches?: Match[] };

function firstScheduled(matches?: Match[]) {
  return matches?.find((m) => m?.status === "SCHEDULED" || m?.status === "TIMED") ?? null;
}

async function getPastMatches(teamId?: number) {
  if (!teamId) return null;
  const data = await fetchFootball<MatchesResponse>(`teams/${teamId}/matches?status=FINISHED&limit=5`);
  return data?.matches ?? null;
}

async function buildSnapshot() {
  const team = await fetchFootball<TeamResponse>(`teams/${LIVERPOOL_ID}`);

  const leagueIds =
    team?.runningCompetitions
      ?.map((c) => c.code)
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i) ?? [];

  const leagues = await Promise.all(
    leagueIds.map((leagueId) =>
      leagueId ? fetchFootball<StandingLeague>(`competitions/${leagueId}/standings`) : null,
    ),
  );
  const leaguesData = leagues
    .map((league, index) => {
      const leagueId = leagueIds[index];
      if (!league || !leagueId) return null;
      return { leagueId, league };
    })
    .filter(Boolean) as Array<{ leagueId: string; league: StandingLeague }>;

  const nextGames = await fetchFootball<MatchesResponse>(`teams/${LIVERPOOL_ID}/matches?status=SCHEDULED`);
  const matchDetails = firstScheduled(nextGames.matches);
  const awayForm = await getPastMatches(matchDetails?.awayTeam?.id);
  const homeForm = await getPastMatches(matchDetails?.homeTeam?.id);

  return {
    team,
    leaguesData,
    nextMatchData: {
      matchDetails,
      awayForm,
      homeForm,
    },
  };
}

const SNAPSHOT_CACHE_KEY = "soccer-snapshot";
const SNAPSHOT_TTL_MS = 10 * 60 * 1000;

export const getSnapshot = query({
  args: {},
  handler: async (ctx) => {
    return await readCachedJson(ctx, SNAPSHOT_CACHE_KEY);
  },
});

export const storeSnapshot = internalMutation({
  args: { snapshot: v.any() },
  handler: async (ctx, args) => {
    await upsertCacheEntry(ctx, {
      dataType: SNAPSHOT_CACHE_KEY,
      source: "football-api",
      payload: JSON.stringify(args.snapshot),
      expiresAt: Date.now() + SNAPSHOT_TTL_MS,
    });
    return args.snapshot;
  },
});

export const refreshSnapshot = action({
  args: {},
  handler: async (ctx) => {
    const snapshot = await buildSnapshot();
    await ctx.runMutation(internal.football.storeSnapshot, { snapshot });
    return snapshot;
  },
});
