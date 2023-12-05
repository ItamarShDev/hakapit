import type { Stats } from "~/api/football/types";

export default {
  get: "teams/statistics",
  parameters: {
    league: "39",
    season: "2023",
    team: "40",
  },
  errors: [],
  results: 11,
  paging: {
    current: 1,
    total: 1,
  },
  response: {
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media-4.api-sports.io/football/leagues/39.png",
      flag: "https://media-4.api-sports.io/flags/gb.svg",
      season: 2023,
    },
    team: {
      id: 40,
      name: "Liverpool",
      logo: "https://media-4.api-sports.io/football/teams/40.png",
    },
    form: "DWWWWWLDWWDWDW",
    fixtures: {
      played: {
        home: 7,
        away: 7,
        total: 14,
      },
      wins: {
        home: 7,
        away: 2,
        total: 9,
      },
      draws: {
        home: 0,
        away: 4,
        total: 4,
      },
      loses: {
        home: 0,
        away: 1,
        total: 1,
      },
    },
    goals: {
      for: {
        total: {
          home: 21,
          away: 11,
          total: 32,
        },
        average: {
          home: "3.0",
          away: "1.6",
          total: "2.3",
        },
        minute: {
          "0-15": {
            total: 1,
            percentage: "3.33%",
          },
          "16-30": {
            total: 3,
            percentage: "10.00%",
          },
          "31-45": {
            total: 6,
            percentage: "20.00%",
          },
          "46-60": {
            total: 5,
            percentage: "16.67%",
          },
          "61-75": {
            total: 4,
            percentage: "13.33%",
          },
          "76-90": {
            total: 7,
            percentage: "23.33%",
          },
          "91-105": {
            total: 4,
            percentage: "13.33%",
          },
          "106-120": {
            total: null,
            percentage: null,
          },
        },
      },
      against: {
        total: {
          home: 5,
          away: 9,
          total: 14,
        },
        average: {
          home: "0.7",
          away: "1.3",
          total: "1.0",
        },
        minute: {
          "0-15": {
            total: 2,
            percentage: "12.50%",
          },
          "16-30": {
            total: 6,
            percentage: "37.50%",
          },
          "31-45": {
            total: 3,
            percentage: "18.75%",
          },
          "46-60": {
            total: 1,
            percentage: "6.25%",
          },
          "61-75": {
            total: null,
            percentage: null,
          },
          "76-90": {
            total: 3,
            percentage: "18.75%",
          },
          "91-105": {
            total: 1,
            percentage: "6.25%",
          },
          "106-120": {
            total: null,
            percentage: null,
          },
        },
      },
    },
    biggest: {
      streak: {
        wins: 5,
        draws: 1,
        loses: 1,
      },
      wins: {
        home: "3-0",
        away: "1-3",
      },
      loses: {
        home: null,
        away: "2-1",
      },
      goals: {
        for: {
          home: 4,
          away: 3,
        },
        against: {
          home: 3,
          away: 2,
        },
      },
    },
    clean_sheet: {
      home: 4,
      away: 0,
      total: 4,
    },
    failed_to_score: {
      home: 0,
      away: 0,
      total: 0,
    },
    penalty: {
      scored: {
        total: 3,
        percentage: "100.00%",
      },
      missed: {
        total: 0,
        percentage: "0%",
      },
      total: 3,
    },
    lineups: [
      {
        formation: "4-3-3",
        played: 14,
      },
    ],
    cards: {
      yellow: {
        "0-15": {
          total: 3,
          percentage: "12.00%",
        },
        "16-30": {
          total: 1,
          percentage: "4.00%",
        },
        "31-45": {
          total: 3,
          percentage: "12.00%",
        },
        "46-60": {
          total: 3,
          percentage: "12.00%",
        },
        "61-75": {
          total: 6,
          percentage: "24.00%",
        },
        "76-90": {
          total: 5,
          percentage: "20.00%",
        },
        "91-105": {
          total: 4,
          percentage: "16.00%",
        },
        "106-120": {
          total: null,
          percentage: null,
        },
      },
      red: {
        "0-15": {
          total: null,
          percentage: null,
        },
        "16-30": {
          total: 2,
          percentage: "50.00%",
        },
        "31-45": {
          total: null,
          percentage: null,
        },
        "46-60": {
          total: 1,
          percentage: "25.00%",
        },
        "61-75": {
          total: 1,
          percentage: "25.00%",
        },
        "76-90": {
          total: null,
          percentage: null,
        },
        "91-105": {
          total: null,
          percentage: null,
        },
        "106-120": {
          total: null,
          percentage: null,
        },
      },
    },
  },
} as Stats;
