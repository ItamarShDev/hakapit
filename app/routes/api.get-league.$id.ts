import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getLeague } from "~/api/fotmob-api";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const leagueId = params.id;
	if (!leagueId) {
		return json("Missing id", 404);
	}
	const league = await getLeague(Number.parseInt(leagueId));
	return json(league, 200);
};
