import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { readCachedJson, upsertCacheEntry } from "./cache";

import type { ActionCtx } from "./_generated/server";

const FOOTBALL_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const LIVERPOOL_ID = 64;

type FootballCtx = ActionCtx;

const HOUR_MS = 60 * 60 * 1000;
const TEAM_TTL_MS = 6 * HOUR_MS;
const STANDINGS_TTL_MS = 2 * HOUR_MS;
const FIXTURES_TTL_MS = 20 * 60 * 1000;
const LIVE_TTL_MS = 2 * 60 * 1000;
const FORM_TTL_MS = 3 * HOUR_MS;

// football-data.org returns 403 for competitions outside the plan and 429 on rate
// limits; a single failing sub-request must not take down the whole snapshot.
async function fetchFootball<T>(path: string): Promise<T | null> {
  if (!FOOTBALL_API_KEY) {
    throw new Error("FOOTBALL_DATA_API_KEY missing in Convex environment");
  }
  const res = await fetch(`https://api.football-data.org/v4/${path}`, {
    headers: { "X-Auth-Token": FOOTBALL_API_KEY },
  });
  if (!res.ok) {
    console.warn(`football-data ${res.status} for ${path}`);
    return null;
  }
  return (await res.json()) as T;
}

async function fetchFootballCached<T>(
  ctx: FootballCtx,
  key: string,
  ttl: number | ((value: T) => number),
  path: string,
): Promise<T | null> {
  const cached = (await ctx.runQuery(internal.football.readCached, { key })) as T | null;
  if (cached != null) return cached;
  const value = await fetchFootball<T>(path);
  if (value != null) {
    await ctx.runMutation(internal.cache.updateCacheTracking, {
      dataType: key,
      source: "football-api",
      payload: JSON.stringify(value),
      expiresAt: Date.now() + (typeof ttl === "function" ? ttl(value) : ttl),
    });
  }
  return value;
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

const LIVE_STATUSES = ["IN_PLAY", "PAUSED"];
const UPCOMING_STATUSES = ["SCHEDULED", "TIMED"];

function isLive(match?: Match | null) {
  return !!match?.status && LIVE_STATUSES.includes(match.status);
}

// Live: refresh often. Upcoming: expire no later than kickoff so the first
// post-kickoff request picks up the live status.
function matchTtl(match: Match | null | undefined, defaultTtl: number) {
  if (isLive(match)) return LIVE_TTL_MS;
  const kickoff = match?.utcDate ? Date.parse(match.utcDate) : NaN;
  if (Number.isNaN(kickoff)) return defaultTtl;
  return Math.max(LIVE_TTL_MS, Math.min(defaultTtl, kickoff - Date.now()));
}

// Prefer a match in progress; otherwise the earliest upcoming one.
function pickNextMatch(matches?: Match[]) {
  return matches?.find(isLive) ?? matches?.find((m) => !!m?.status && UPCOMING_STATUSES.includes(m.status)) ?? null;
}

async function getPastMatches(ctx: FootballCtx, teamId?: number) {
  if (!teamId) return null;
  const data = await fetchFootballCached<MatchesResponse>(
    ctx,
    `games-${teamId}-past-5`,
    FORM_TTL_MS,
    `teams/${teamId}/matches?status=FINISHED&limit=5`,
  );
  return data?.matches ?? null;
}

type Snapshot = {
  team: TeamResponse;
  leaguesData: Array<{ leagueId: string; league: StandingLeague }>;
  nextMatchData: { matchDetails: Match | null; awayForm: Match[] | null; homeForm: Match[] | null };
};

async function buildSnapshot(ctx: FootballCtx): Promise<Snapshot> {
  const team = await fetchFootballCached<TeamResponse>(
    ctx,
    `team-${LIVERPOOL_ID}`,
    TEAM_TTL_MS,
    `teams/${LIVERPOOL_ID}`,
  );
  if (!team) {
    throw new Error("football-data team request failed");
  }

  const leagueIds = [
    ...new Set((team.runningCompetitions ?? []).map((c) => c.code).filter((code): code is string => !!code)),
  ];

  const leagues = await Promise.all(
    leagueIds.map((leagueId) =>
      leagueId
        ? fetchFootballCached<StandingLeague>(
            ctx,
            `league-${leagueId}`,
            STANDINGS_TTL_MS,
            `competitions/${leagueId}/standings`,
          )
        : null,
    ),
  );
  const leaguesData = leagues
    .map((league, index) => {
      const leagueId = leagueIds[index];
      if (!league || !leagueId) return null;
      return { leagueId, league };
    })
    .filter(Boolean) as Array<{ leagueId: string; league: StandingLeague }>;

  const nextGames = await fetchFootballCached<MatchesResponse>(
    ctx,
    "games-liverpool-next",
    (data) => matchTtl(pickNextMatch(data.matches), FIXTURES_TTL_MS),
    `teams/${LIVERPOOL_ID}/matches?status=${[...LIVE_STATUSES, ...UPCOMING_STATUSES].join(",")}`,
  );
  const matchDetails = pickNextMatch(nextGames?.matches);
  const awayForm = await getPastMatches(ctx, matchDetails?.awayTeam?.id);
  const homeForm = await getPastMatches(ctx, matchDetails?.homeTeam?.id);

  const fresh: Snapshot = { team, leaguesData, nextMatchData: { matchDetails, awayForm, homeForm } };
  const previous = (await ctx.runQuery(internal.football.readSnapshot, { allowStale: true })) as Snapshot | null;
  return previous ? mergeWithPrevious(fresh, previous, leagueIds, nextGames != null) : fresh;
}

// A failed sub-request yields null/empty; keep the previous snapshot's section
// rather than replacing complete data with a hole.
function mergeWithPrevious(
  fresh: Snapshot,
  previous: Snapshot,
  requestedLeagueIds: string[],
  fixturesFetched: boolean,
): Snapshot {
  const next = fresh.nextMatchData;
  const prev: Snapshot["nextMatchData"] | undefined = previous.nextMatchData;
  const nextId = next.matchDetails?.id;
  const sameMatch = nextId != null && nextId === prev?.matchDetails?.id;

  const freshLeagues = new Map(fresh.leaguesData.map((entry) => [entry.leagueId, entry]));
  const previousLeagues = new Map((previous.leaguesData ?? []).map((entry) => [entry.leagueId, entry]));

  return {
    team: fresh.team,
    leaguesData: requestedLeagueIds.flatMap((leagueId) => {
      const entry = freshLeagues.get(leagueId) ?? previousLeagues.get(leagueId);
      return entry ? [entry] : [];
    }),
    nextMatchData:
      !fixturesFetched && prev
        ? prev
        : {
            matchDetails: next.matchDetails,
            awayForm: next.awayForm ?? (sameMatch ? prev.awayForm : null),
            homeForm: next.homeForm ?? (sameMatch ? prev.homeForm : null),
          },
  };
}

const SNAPSHOT_CACHE_KEY = "soccer-snapshot";
const SNAPSHOT_TTL_MS = 20 * 60 * 1000;

export const readCached = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, args): Promise<unknown> => {
    return await readCachedJson(ctx, args.key);
  },
});

export const readSnapshot = internalQuery({
  args: { allowStale: v.optional(v.boolean()) },
  handler: async (ctx, args): Promise<unknown> => {
    return await readCachedJson(ctx, SNAPSHOT_CACHE_KEY, { allowStale: args.allowStale });
  },
});

export const storeSnapshot = internalMutation({
  args: { snapshot: v.any() },
  handler: async (ctx, args) => {
    await upsertCacheEntry(ctx, {
      dataType: SNAPSHOT_CACHE_KEY,
      source: "football-api",
      payload: JSON.stringify(args.snapshot),
      expiresAt: Date.now() + matchTtl((args.snapshot as Snapshot).nextMatchData?.matchDetails, SNAPSHOT_TTL_MS),
    });
    return args.snapshot;
  },
});

export const refreshSnapshot = internalAction({
  args: {},
  handler: async (ctx) => {
    const snapshot = await buildSnapshot(ctx);
    await ctx.runMutation(internal.football.storeSnapshot, { snapshot });
    return snapshot;
  },
});

export const ensureSnapshot = action({
  args: {},
  handler: async (ctx): Promise<unknown> => {
    const cached = await ctx.runQuery(internal.football.readSnapshot, {});
    if (cached != null) return cached;
    try {
      return await ctx.runAction(internal.football.refreshSnapshot);
    } catch (err) {
      console.warn("soccer snapshot refresh failed, serving stale snapshot", err);
      return await ctx.runQuery(internal.football.readSnapshot, { allowStale: true });
    }
  },
});
