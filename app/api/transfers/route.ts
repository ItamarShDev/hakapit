import { unstable_noStore as noStore } from "next/cache";
import { getLatestTransfers } from "~/providers/football-api";

export async function GET() {
	noStore();
	try {
		const transfersPerPlayer = await getLatestTransfers();
		if (transfersPerPlayer && Object.keys(transfersPerPlayer).length > 0) {
			return new Response(JSON.stringify(transfersPerPlayer), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}
	} catch (error) {
		// Handle database quota errors gracefully during build
		console.warn("Football API unavailable during build:", error);
	}
	return new Response(JSON.stringify([]), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
}
