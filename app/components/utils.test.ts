import { expect, test } from "bun:test";
import type { Score } from "../providers/soccer-api/types/team-matches";
import { getDisplayScore } from "./utils";

test("getDisplayScore should return fullTime score when available", () => {
	const score: Score = {
		winner: "HOME_TEAM",
		duration: "REGULAR",
		fullTime: { home: 2, away: 1 },
		halfTime: { home: 1, away: 0 },
	};
	expect(getDisplayScore(score, "home")).toBe(2);
	expect(getDisplayScore(score, "away")).toBe(1);
});

test("getDisplayScore should return halfTime score when fullTime is undefined", () => {
	const score: Score = {
		winner: "HOME_TEAM",
		duration: "REGULAR",
		fullTime: { home: undefined, away: undefined },
		halfTime: { home: 1, away: 0 },
	};
	expect(getDisplayScore(score, "home")).toBe(1);
	expect(getDisplayScore(score, "away")).toBe(0);
});

test("getDisplayScore should return undefined when both scores are undefined", () => {
	const score: Score = {
		winner: undefined,
		duration: "REGULAR",
		fullTime: { home: undefined, away: undefined },
		halfTime: { home: undefined, away: undefined },
	};
	expect(getDisplayScore(score, "home")).toBeNull();
	expect(getDisplayScore(score, "away")).toBeNull();
});

test("getDisplayScore should return halfTime score when fullTime is undefined", () => {
	const score: Score = {
		winner: "AWAY_TEAM",
		duration: "REGULAR",
		fullTime: { home: undefined, away: undefined },
		halfTime: { home: 0, away: 1 },
	};
	expect(getDisplayScore(score, "home")).toBe(0);
	expect(getDisplayScore(score, "away")).toBe(1);
});
