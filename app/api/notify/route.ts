import { notifyAllUsers } from "notifications/handlers";
import { getLatestTransfers } from "~/providers/football-api";
import { getLatestEpisode } from "~/providers/rss/get-latest-episode";

export async function GET() {
	await notifyTransferData();
	await notifyEpisodeData();
	return new Response("OK", {
		status: 200,
	});
}

export async function notifyTransferData() {
	const transfers = await getLatestTransfers();
	for (const transfer in transfers) {
		const message = `${transfers[transfer].playerName} ${transfers[transfer].type}`;
		await notifyAllUsers(message);
	}
}

export async function notifyEpisodeData() {
	const episode = await getLatestEpisode();
	if (!episode) {
		return;
	}
	for (const item of Object.values(episode)) {
		await notifyAllUsers(`פרק חדש: ${item.title}`);
	}
}
