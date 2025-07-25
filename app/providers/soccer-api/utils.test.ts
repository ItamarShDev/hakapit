import { expect, test } from "bun:test";
import { getFirstMatch } from "./utils";
import type { TeamMatches, Match } from "./types/team-matches";

const mockMatch: Match = {
    id: 1,
    utcDate: "2023-09-03T15:30:00Z",
    status: "SCHEDULED",
    matchday: 4,
    stage: "REGULAR_SEASON",
    group: null,
    lastUpdated: "2023-08-28T16:20:07Z",
    homeTeam: { id: 64, name: "Liverpool FC", shortName: "Liverpool", tla: "LIV", crest: "" },
    awayTeam: { id: 58, name: "Aston Villa FC", shortName: "Aston Villa", tla: "AVL", crest: "" },
    score: { winner: null, duration: "REGULAR", fullTime: { home: null, away: null }, halfTime: { home: null, away: null } },
    odds: { msg: "Activate Odds-Package in User-Panel to retrieve odds." },
    referees: [],
    area: { id: 2072, name: "England", code: "ENG", flag: "" },
    competition: { id: 2021, name: "Premier League", code: "PL", type: "LEAGUE", emblem: "" },
    season: { id: 1504, startDate: "2023-08-11", endDate: "2024-05-19", currentMatchday: 4, winner: null },
};

const mockTeamMatches: TeamMatches = {
    filters: { competitions: "PL", permission: "TIER_ONE", limit: 1 },
    resultSet: { count: 1, competitions: "PL", first: "2023-09-03", last: "2023-09-03", played: 0, wins: 0, draws: 0, losses: 0 },
    matches: [mockMatch],
};

test("getFirstMatch should return the first match when matches exist", () => {
    const result = getFirstMatch(mockTeamMatches);
    expect(result).toEqual(mockMatch);
});

test("getFirstMatch should return undefined when matches array is empty", () => {
    const noMatches: TeamMatches = { ...mockTeamMatches, matches: [] };
    const result = getFirstMatch(noMatches);
    expect(result).toBeUndefined();
});

test("getFirstMatch should return undefined when input is null", () => {
    const result = getFirstMatch(null);
    expect(result).toBeUndefined();
});
