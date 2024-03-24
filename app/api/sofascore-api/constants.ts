export const LIVERPOOL_ID = 44;
export const BASE_URL = "https://api.sofascore.com/api/v1";
const BASE_URL_2 = "https://api.sofascore.com/api/v1";
export function getTeamImage(teamId: number) {
	return `https://api.sofascore.app/api/v1/team/${teamId}/image`;
}
