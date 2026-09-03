import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalAction, internalMutation, mutation, query } from "./_generated/server";

import type { MutationCtx, QueryCtx } from "./_generated/server";

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

async function writeSnapshotCache(ctx: MutationCtx, snapshot: unknown, ttlMs: number) {
  const now = Date.now();
  const existing = await ctx.db
    .query("cacheTracking")
    .withIndex("by_dataType", (q) => q.eq("dataType", "soccer-snapshot"))
    .first();
  const payload = JSON.stringify(snapshot);
  const doc = {
    dataType: "soccer-snapshot",
    source: "football-api",
    payload,
    lastUpdated: now,
    updatedAt: now,
    expiresAt: now + ttlMs,
    metadata: undefined,
  };
  if (existing) {
    await ctx.db.replace(existing._id, { ...existing, ...doc });
    return existing._id;
  }
  return await ctx.db.insert("cacheTracking", { ...doc, createdAt: now });
}

async function readSnapshotCache(ctx: QueryCtx) {
  const entry = await ctx.db
    .query("cacheTracking")
    .withIndex("by_dataType", (q) => q.eq("dataType", "soccer-snapshot"))
    .first();
  if (!entry || !entry.payload) return null;
  if (entry.expiresAt && entry.expiresAt < Date.now()) return null;
  try {
    return JSON.parse(entry.payload);
  } catch (err) {
    console.warn("Failed to parse soccer-snapshot cache", err);
    return null;
  }
}

const SNAPSHOT_TTL = 10 * 60 * 1000;

export const getSnapshot = query({
  args: {},
  handler: async (ctx) => {
    const cached = await readSnapshotCache(ctx);
    if (cached) return cached;
    const snapshot = await buildSnapshot();
    return snapshot;
  },
});

export const storeSnapshot = internalMutation({
  args: { snapshot: v.any() },
  handler: async (ctx, args) => {
    await writeSnapshotCache(ctx, args.snapshot, SNAPSHOT_TTL);
    return args.snapshot;
  },
});

export const refreshSnapshot = internalAction({
  args: {},
  handler: async (ctx) => {
    const snapshot = await buildSnapshot();
    await ctx.runMutation(internal.football.storeSnapshot, { snapshot });
    return snapshot;
  },
});

export const clearTransferPhoto = mutation({
  args: {
    transferId: v.id("transfers"),
  },
  handler: async (ctx, args) => {
    const transfer = await ctx.db.get(args.transferId);
    if (!transfer) {
      throw new Error("Transfer not found");
    }

    const { playerPhoto: _playerPhoto, ...transferWithoutPhoto } = transfer;

    await ctx.db.replace(args.transferId, transferWithoutPhoto);

    return { success: true };
  },
});

export const getAllTransfers = query({
  handler: async (ctx) => {
    return await ctx.db.query("transfers").collect();
  },
});

export const getTransferByPlayerId = query({
  args: { playerId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transfers")
      .withIndex("by_playerId", (q) => q.eq("playerId", args.playerId))
      .first();
  },
});

export const getTransfersByTeamId = query({
  args: { teamId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transfers")
      .withIndex("by_teamId", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

export const upsertTransfer = mutation({
  args: {
    playerId: v.number(),
    playerName: v.string(),
    playerPhoto: v.optional(v.string()),
    date: v.number(),
    teamId: v.number(),
    teamName: v.string(),
    teamLogo: v.optional(v.string()),
    type: v.optional(v.string()),
    direction: v.string(),
    action: v.string(),
    price: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("transfers")
      .withIndex("by_playerId", (q) => q.eq("playerId", args.playerId))
      .first();

    const transferData = {
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, transferData);
      return existing._id;
    }
    return await ctx.db.insert("transfers", transferData);
  },
});

export const getFetchTime = query({
  handler: async (ctx) => {
    const fetchTimeRecord = await ctx.db.query("fetchTime").first();
    return fetchTimeRecord?.updatedAt || null;
  },
});

export const updateFetchTime = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("fetchTime").first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        updatedAt: Date.now(),
      });
      return existing._id;
    }
    return await ctx.db.insert("fetchTime", {
      updatedAt: Date.now(),
    });
  },
});

export const deleteTransfer = mutation({
  args: { playerId: v.number() },
  handler: async (ctx, args) => {
    const transfer = await ctx.db
      .query("transfers")
      .withIndex("by_playerId", (q) => q.eq("playerId", args.playerId))
      .first();

    if (transfer) {
      await ctx.db.delete(transfer._id);
      return { success: true };
    }

    return { success: false, message: "Transfer not found" };
  },
});
