type GamesForm = {
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals: {
    for: number;
    against: number;
  };
};
type MetaData = {
  get: string;
  parameters: {
    league?: string;
    season?: string;
    team?: string;
  };
  errors: [];
  results: number;
  paging: {
    current: number;
    total: number;
  };
};

export interface Standings extends MetaData {
  response: {
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      flag: string;
      season: number;
      standings: {
        rank: number;
        team: {
          id: number;
          name: string;
          logo: string;
        };
        points: number;
        goalsDiff: number;
        group: string;
        form: string;
        status: string;
        description: string;
        all: GamesForm;
        home: GamesForm;
        away: GamesForm;
        update: string;
      }[][];
    };
  }[];
}

type Played = {
  home: number | string;
  away: number | string;
  total: number | string;
};
type TotalAvg = {
  total: number | null;
  percentage: string | null;
};

export type Stats = MetaData & {
  response: {
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      flag: string;
      season: number;
    };
    team: {
      id: number;
      name: string;
      logo: string;
    };
    form: string;
    fixtures: {
      played: Played;
      wins: Played;
      draws: Played;
      loses: Played;
    };
    goals: {
      for: {
        total: Played;
        average: Played;
        minute: {
          [key: string]: TotalAvg;
        };
      };
      against: {
        total: Played;
        average: Played;
        minute: {
          [key: string]: TotalAvg;
        };
      };
    };
    biggest: {
      streak: {
        wins: number;
        draws: number;
        loses: number;
      };
      wins: {
        home: string | null;
        away: string | null;
      };
      loses: {
        home: string | null;
        away: string | null;
      };
      goals: {
        for: {
          home: number;
          away: number;
        };
        against: {
          home: number;
          away: number;
        };
      };
    };
    clean_sheet: Played;
    failed_to_score: Played;
    penalty: {
      scored: TotalAvg;
      missed: TotalAvg;
      total: number;
    };
    lineups: [
      {
        formation: string;
        played: number;
      },
    ];
    cards: {
      [key in "yellow" | "red"]: {
        [key: string]: TotalAvg;
      };
    };
  };
};
