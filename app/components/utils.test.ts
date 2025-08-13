import { expect, test } from "bun:test";
import { getDisplayScore } from "./utils";
import type { Score } from "../providers/soccer-api/types/team-matches";

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

test("getDisplayScore should return halfTime score when fullTime is null", () => {
	const score: Score = {
		winner: "HOME_TEAM",
		duration: "REGULAR",
		fullTime: { home: null, away: null },
		halfTime: { home: 1, away: 0 },
	};
	expect(getDisplayScore(score, "home")).toBe(1);
	expect(getDisplayScore(score, "away")).toBe(0);
});

test("getDisplayScore should return undefined when both scores are null", () => {
	const score: Score = {
		winner: null,
		duration: "REGULAR",
		fullTime: { home: null, away: null },
		halfTime: { home: null, away: null },
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
