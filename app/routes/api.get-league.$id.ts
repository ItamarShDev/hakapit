import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getLeagues } from "~/api/fotmob-api";

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const leagueId = params.id;
	if (!leagueId) {
		return json("Missing id", 404);
	}
	console.info(`Fetching league data for leagueId: ${leagueId}`);
	const leagues = await getLeagues(leagueId);
	return json(leagues, 200);
};
