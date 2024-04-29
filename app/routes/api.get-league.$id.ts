import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getLeague } from "~/server/fotmob-api/index.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const leagueId = params.id;
	if (!leagueId) {
		return json("Missing id", 404);
	}
	try {
		console.info(`Fetching league data for leagueId: ${leagueId}`);
		const league = await getLeague(Number.parseInt(leagueId));
		return json(league, 200);
	} catch (error) {
		console.log(error);
		return json("Error fetching league", 500);
	}
};
