import type { TeamMatches } from "./types/team-matches";

export function getFirstMatch(teamMatches: TeamMatches | null) {
	return teamMatches?.matches[0];
}
