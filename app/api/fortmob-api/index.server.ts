import Fotmob from "~/api/fortmob-api/src/fotmob";
import type { Team } from "~/api/fortmob-api/src/types/team";
export async function getTeam() {
  const fotmob = new Fotmob();
  return (await fotmob.getTeam(8650)) as Team;
}
export function getLeague(league: number) {
  const fotmob = new Fotmob();
  return fotmob.getLeague(league, "table");
}
