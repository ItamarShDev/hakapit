import type { Standings } from "~/api/football/types";

export default {
  get: "standings",
  parameters: { season: "2023", team: "40" },
  errors: [],
  results: 2,
  paging: { current: 1, total: 1 },
  response: [
    {
      league: {
        id: 3,
        name: "UEFA Europa League",
        country: "World",
        logo: "https://media-4.api-sports.io/football/leagues/3.png",
        flag: null,
        season: 2023,
        standings: [
          [
            {
              rank: 1,
              team: {
                id: 40,
                name: "Liverpool",
                logo: "https://media-4.api-sports.io/football/teams/40.png",
              },
              points: 12,
              goalsDiff: 11,
              group: "Group E",
              form: "WLWWW",
              status: "same",
              description: "Promotion - Europa League (Play Offs: 1/8-finals)",
              all: {
                played: 5,
                win: 4,
                draw: 0,
                lose: 1,
                goals: { for: 16, against: 5 },
              },
              home: {
                played: 3,
                win: 3,
                draw: 0,
                lose: 0,
                goals: { for: 11, against: 1 },
              },
              away: {
                played: 2,
                win: 1,
                draw: 0,
                lose: 1,
                goals: { for: 5, against: 4 },
              },
              update: "2023-12-03T00:00:00+00:00",
            },
          ],
        ],
      },
    },
    {
      league: {
        id: 39,
        name: "Premier League",
        country: "England",
        logo: "https://media-4.api-sports.io/football/leagues/39.png",
        flag: "https://media-4.api-sports.io/flags/gb.svg",
        season: 2023,
        standings: [
          [
            {
              rank: 2,
              team: {
                id: 40,
                name: "Liverpool",
                logo: "https://media-4.api-sports.io/football/teams/40.png",
              },
              points: 31,
              goalsDiff: 18,
              group: "Premier League",
              form: "WDWDW",
              status: "same",
              description: "Promotion - Champions League (Group Stage: )",
              all: {
                played: 14,
                win: 9,
                draw: 4,
                lose: 1,
                goals: { for: 32, against: 14 },
              },
              home: {
                played: 7,
                win: 7,
                draw: 0,
                lose: 0,
                goals: { for: 21, against: 5 },
              },
              away: {
                played: 7,
                win: 2,
                draw: 4,
                lose: 1,
                goals: { for: 11, against: 9 },
              },
              update: "2023-12-03T00:00:00+00:00",
            },
          ],
        ],
      },
    },
  ],
} as Standings;
