import type { Standings, Stats } from "~/api/football/types";
type BaseParams = {
  league?: number;
  season?: number;
  team?: number;
};

const DefaultParams = {
  team: 40,
  season: getCurrentSeason(),
};
async function fetchAPI<T>(url: string, params: BaseParams = {}) {
  const key = process.env.API_FOOTBALL_KEY;
  const baseURL = process.env.API_FOOTBALL_URL;
  const path = new URL(url, baseURL);
  for (const [key, value] of Object.entries(params)) {
    path.searchParams.set(key, `${value}`);
  }

  if (!key) {
    throw new Error("API_FOOTBALL_KEY is not defined");
  }
  if (!baseURL) {
    throw new Error("API_FOOTBALL_URL is not defined");
  }
  console.log(path.toString());

  const rest = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      "x-apisports-key": key,
    },
  });
  return (await rest.json()) as T;
}

function getCurrentSeason() {
  return new Date().getFullYear();
}

export async function getTeamStats(leagues: number[] = [39]) {
  // if (process.env.NODE_ENV === "development") {
  //   return [stats];
  // }
  return Promise.all(
    leagues.map((league) =>
      fetchAPI<Stats>("teams/statistics", {
        ...DefaultParams,
        team: 40,
        league,
      })
    )
  );
}

export async function getTeamInfo() {
  // if (process.env.NODE_ENV === "development") {
  //   return standings;
  // }
  return await fetchAPI<Standings>("standings", {
    team: 40,
    season: getCurrentSeason(),
  });
}
