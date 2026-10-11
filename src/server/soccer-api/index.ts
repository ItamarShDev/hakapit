import { createServerFn } from "@tanstack/react-start";
import { api } from "convex/_generated/api";

import { getConvexClient } from "~/server/convex-client";

import type { League } from "~/server/soccer-api/types/league";
import type { Team } from "~/server/soccer-api/types/team";
import type { Match } from "~/server/soccer-api/types/team-matches";

export type NextMatchData = {
  matchDetails: Match | null;
  awayForm: Match[] | null;
  homeForm: Match[] | null;
};

export type SoccerSnapshot = {
  team: Team | null;
  leaguesData: Array<{ leagueId: string; league: League }>;
  nextMatchData: NextMatchData | null;
};

export const getSoccerSnapshot = createServerFn({ method: "GET" }).handler(async (): Promise<SoccerSnapshot | null> => {
  const convex = getConvexClient("warn");
  if (!convex) return null;
  return (await convex.action(api.football.ensureSnapshot)) as SoccerSnapshot;
});
