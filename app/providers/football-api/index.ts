"use server";

import { cacheLife, cacheTag, updateTag } from "next/cache";
import { db } from "~/db/config";
import { cacheTracking } from "~/db/schema/cache-tracking";
import { fetchTime, transfers } from "~/db/schema/transfers";
import { baseUrl, LiverpoolId } from "~/providers/football-api/constants";
import type { PlayerStatsResponse } from "~/providers/football-api/types/player-stats";
import type { TransferResponse } from "~/providers/football-api/types/transfer";
import { isTransferBuy } from "~/providers/football-api/utils";

async function fetchData<T>(path: string, query?: URLSearchParams | Record<string, string>) {
	const params = new URLSearchParams(query);
	const url = new URL(path, baseUrl);
	url.search = params.toString();
	const headers = new Headers();
	headers.set("x-rapidapi-key", process.env.API_FOOTBALL_KEY as string);
	const response = await fetch(url, {
		method: "GET",
		headers: headers,
	});
	return (await response.json()) as T;
}

export async function getLatestTransfers() {
	const results = await getCachedTransferData();
	const newTransfers = results.filter((result) => result.updatedAt.getTime() === Date.now());
	const transfersPerPlayer = Object.fromEntries(newTransfers.map((result) => [result.playerName, result]));
	return transfersPerPlayer;
}

export async function getCachedTransferData() {
	"use cache";
	cacheLife("days");
	cacheTag("transfers");

	const isDev = process.env.NODE_ENV === "development";

	// get last update from transfers db
	const lastUpdate = await db.query.fetchTime.findFirst();
	// if last update is today, return db data
	if (lastUpdate?.updatedAt.toDateString() === new Date().toDateString()) {
		const dbData = await db.select().from(transfers);
		return dbData;
	}

	const data = await fetchData<TransferResponse>("transfers", { team: String(LiverpoolId) });
	type TransferItem = TransferResponse["response"][number];
	type InnerTransfer = TransferItem["transfers"][number];
	const onlyTransfersFromLastYear: Array<{
		updatedAt: Date;
		playerId: number;
		date: Date;
		teamId: number;
		type: string | undefined;
		playerName: string;
		playerPhoto?: string;
		teamName: string;
		teamLogo?: string;
	}> = [];

	// Sort and filter transfers first
	const validTransferItems: TransferItem[] = data.response
		.sort((a: TransferItem, b: TransferItem) => new Date(b.update).getTime() - new Date(a.update).getTime())
		.filter((transferItem: TransferItem) => {
			const isCurrentYear = transferItem.transfers.some(
				(transfer: InnerTransfer) => new Date(transfer.date).getFullYear() === new Date().getFullYear(),
			);
			const isBuy = transferItem.transfers.every(
				(transfer: InnerTransfer) => transfer.teams.in.id === LiverpoolId && isTransferBuy(transfer.type),
			);
			return isCurrentYear && isBuy;
		});

	if (isDev) console.time("player-data-fetch");
	// Batch fetch all player data in parallel with error handling
	const playerDataPromises = validTransferItems.map((transferItem: TransferItem) =>
		getCachedPlayerData(transferItem.player.id).catch((error) => {
			if (isDev) console.error(`Failed to fetch player data for ${transferItem.player.name}:`, error);
			return null;
		}),
	);
	const playerDataResults = await Promise.all(playerDataPromises);
	if (isDev) console.timeEnd("player-data-fetch");

	for (let i = 0; i < validTransferItems.length; i++) {
		const transferItem = validTransferItems[i];
		const player = playerDataResults[i];

		if (!player) continue; // Skip if player data failed to fetch

		const transferDTO = {
			updatedAt: new Date(),
			playerId: transferItem.player.id,
			date: new Date(transferItem.update),
			teamId: transferItem.transfers[0].teams.out.id,
			type: transferItem.transfers[0].type ?? undefined,
			playerName: transferItem.player.name,
			playerPhoto: player.response[0].player.photo ?? undefined,
			teamName: transferItem.transfers[0].teams.out.name,
			teamLogo: transferItem.transfers[0].teams.out.logo ?? undefined,
		};
		onlyTransfersFromLastYear.push(transferDTO);
	}
	if (onlyTransfersFromLastYear.length === 0) {
		return [];
	}
	// upsert transfers by player_id and update last fetch time
	db.insert(transfers).values(onlyTransfersFromLastYear).onConflictDoNothing({ target: transfers.playerId }).execute();
	db.update(fetchTime).set({ updatedAt: new Date() }).execute();
	if (isDev) {
		console.log("Returning data from API fetch:", onlyTransfersFromLastYear);
		console.timeEnd("transfer-fetch");
	}
	return onlyTransfersFromLastYear;
}

async function getCachedPlayerData(playerId: number) {
	"use cache";
	cacheLife("days");
	cacheTag(`player-${playerId}`);
	return await fetchData<PlayerStatsResponse>("players/profiles", { player: String(playerId) });
}

// Rate-limited refresh action for transfers with database persistence
const REFRESH_COOLDOWN = 5 * 60 * 1000; // 5 minutes between manual refreshes

export async function refreshTransferData(): Promise<{
	success: boolean;
	message: string;
	data?: Awaited<ReturnType<typeof getCachedTransferData>>;
}> {
	"use server";
	const isDev = process.env.NODE_ENV === "development";
	if (isDev) console.log("Manual transfer data refresh triggered");

	// Check database for last refresh time using independent tracking
	const lastRefreshRecord = await db.query.cacheTracking.findFirst({
		where: (cacheTracking, { eq }) => eq(cacheTracking.dataType, "transfers"),
	});
	const now = Date.now();

	// Rate limiting: prevent API hammering
	if (lastRefreshRecord?.updatedAt) {
		const timeSinceLastRefresh = now - lastRefreshRecord.updatedAt.getTime();
		if (timeSinceLastRefresh < REFRESH_COOLDOWN) {
			const waitTime = Math.ceil((REFRESH_COOLDOWN - timeSinceLastRefresh) / 60000);
			throw new Error(`Please wait ${waitTime} minutes before refreshing again`);
		}
	}

	try {
		// Update the timestamp in database for rate limiting first
		await db
			.insert(cacheTracking)
			.values({ dataType: "transfers", source: "football-api", updatedAt: new Date() })
			.onConflictDoUpdate({ target: cacheTracking.dataType, set: { updatedAt: new Date() } })
			.execute();

		// Update the cache tag using Next.js updateTag for immediate refresh
		updateTag("transfers");

		// Fetch fresh data after cache invalidation for read-your-writes
		const freshData = await getCachedTransferData();

		return { success: true, message: "Transfer data refreshed immediately", data: freshData };
	} catch (error) {
		// Error handling: if cache update fails but timestamp was updated,
		// user will get fresh data on next request anyway
		console.error("Failed to refresh transfer data:", error);
		throw error;
	}
}
