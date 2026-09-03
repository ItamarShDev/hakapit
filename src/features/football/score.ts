import type { Score } from "~/server/soccer-api/types/team-matches";

export function getDisplayScore(score: Score, teamType: "home" | "away") {
  return score.fullTime[teamType] ?? score.halfTime[teamType] ?? null;
}
