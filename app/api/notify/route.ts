import { unstable_noStore as noStore } from "next/cache";
import { notifyAllUsers } from "notifications/handlers";
import { getLatestTransfers } from "~/providers/football-api";
import { getLatestEpisode } from "~/providers/rss/get-latest-episode";

export async function GET() {
	noStore();
	try {
		await notifyTransferData();
	} catch (error) {
		console.warn("Notify transfers failed during build:", error);
	}
	try {
		await notifyEpisodeData();
	} catch (error) {
		console.warn("Notify episodes failed during build:", error);
	}
	return new Response("OK", {
		status: 200,
	});
}

async function notifyTransferData() {
	const transfers = await getLatestTransfers();
	for (const transfer in transfers) {
		const message = `${transfers[transfer].playerName} ${transfers[transfer].type}`;
		await notifyAllUsers(message);
	}
}

async function notifyEpisodeData() {
	const episode = await getLatestEpisode();
	if (!episode) {
		return;
	}
	for (const item of Object.values(episode)) {
		await notifyAllUsers(`פרק חדש: ${item.title}`);
	}
}
