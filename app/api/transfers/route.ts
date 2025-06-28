import { getLatestTransfers } from "~/providers/football-api";

export async function GET() {
	const transfersPerPlayer = await getLatestTransfers();
	if (transfersPerPlayer && Object.keys(transfersPerPlayer).length > 0) {
		return new Response(JSON.stringify(transfersPerPlayer), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
	return new Response(JSON.stringify([]), {
		status: 304,
		headers: {
			"Content-Type": "application/json",
		},
	});
}
