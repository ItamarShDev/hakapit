"use server";

import { ConvexHttpClient } from "convex/browser";
import { updateTag } from "next/cache";
import { api } from "~/convex/_generated/api";
import type { Doc } from "~/convex/_generated/dataModel";
import { baseUrl, LiverpoolId } from "~/providers/football-api/constants";
import type { PlayerStatsResponse } from "~/providers/football-api/types/player-stats";
import type { TransferResponse } from "~/providers/football-api/types/transfer";
import { isTransferBuy } from "~/providers/football-api/utils";

// Initialize Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
	throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is required");
}
const convex = new ConvexHttpClient(convexUrl);

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
	const newTransfers = results.filter((result) => result.updatedAt === Date.now());
	const transfersPerPlayer = Object.fromEntries(newTransfers.map((result) => [result.playerName, result]));
	return transfersPerPlayer;
}

export async function getCachedTransferData(): Promise<Doc<"transfers">[]> {
	try {
		// Get last update from Convex
		const lastUpdate = await convex.query(api.football.getFetchTime);
		const lastUpdateTime = lastUpdate;

		// If last update is today, return Convex data
		if (lastUpdateTime && new Date(lastUpdateTime).toDateString() === new Date().toDateString()) {
			return await convex.query(api.football.getAllTransfers);
		}
	} catch (error) {
		console.warn("Convex database unavailable during fetch:", error);
		// Continue with API fetch as fallback
	}

	const data = await fetchData<TransferResponse>("transfers", { team: String(LiverpoolId) });
	type TransferItem = TransferResponse["response"][number];
	type InnerTransfer = TransferItem["transfers"][number];
	const onlyTransfersFromLastYear: Array<{
		updatedAt: number;
		playerId: number;
		date: number;
		teamId: number;
		type: string | undefined;
		playerName: string;
		playerPhoto?: string;
		teamName: string;
		teamLogo?: string;
		direction: string;
		action: string;
		price?: string;
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

	console.time("player-data-fetch");
	// Batch fetch all player data in parallel with error handling
	const playerDataPromises = validTransferItems.map((transferItem: TransferItem) =>
		getCachedPlayerData(transferItem.player.id).catch((error) => {
			console.error(`Failed to fetch player data for ${transferItem.player.name}:`, error);
			return null;
		}),
	);
	const playerDataResults = await Promise.all(playerDataPromises);
	console.timeEnd("player-data-fetch");

	for (let i = 0; i < validTransferItems.length; i++) {
		const transferItem = validTransferItems[i];
		const player = playerDataResults[i];

		if (!player) continue; // Skip if player data failed to fetch

		const transferDTO = {
			updatedAt: Date.now(),
			playerId: transferItem.player.id,
			date: new Date(transferItem.update).getTime(),
			teamId: transferItem.transfers[0].teams.out?.id || 0,
			type: transferItem.transfers[0].type ?? undefined,
			playerName: transferItem.player.name,
			playerPhoto: player.response[0].player.photo ?? undefined,
			teamName: transferItem.transfers[0].teams.out?.name ?? "Unknown Team",
			teamLogo: transferItem.transfers[0].teams.out?.logo ?? undefined,
			direction: "IN",
			action: "BUY",
		};

		// Only include transfers with valid teamId (not null/undefined)
		if (transferDTO.teamId != null && transferDTO.teamId !== 0) {
			onlyTransfersFromLastYear.push(transferDTO);
		}
	}
	if (onlyTransfersFromLastYear.length === 0) {
		return [];
	}
	// upsert transfers to Convex and update last fetch time
	for (const transfer of onlyTransfersFromLastYear) {
		try {
			await convex.mutation(api.football.upsertTransfer, transfer);
		} catch (error) {
			console.warn(`Failed to upsert transfer ${transfer.playerName}:`, error);
		}
	}
	await convex.mutation(api.football.updateFetchTime);
	console.log("Returning data from API fetch:", onlyTransfersFromLastYear);
	console.timeEnd("transfer-fetch");
	return await convex.query(api.football.getAllTransfers);
}

async function getCachedPlayerData(playerId: number) {
	return await fetchData<PlayerStatsResponse>("players/profiles", { player: String(playerId) });
}

// Rate-limited refresh action for transfers with Convex persistence
const REFRESH_COOLDOWN = 5 * 60 * 1000; // 5 minutes between manual refreshes

export async function refreshTransferData(): Promise<{
	success: boolean;
	message: string;
	data?: Awaited<ReturnType<typeof getCachedTransferData>>;
}> {
	"use server";
	console.log("Manual transfer data refresh triggered");

	// Check Convex for last refresh time using cache tracking
	try {
		const cacheRecords = await convex.query(api.migrate.getCacheByDataType, { dataType: "transfers" });
		const lastRefreshRecord = cacheRecords[0];
		const now = Date.now();

		// Rate limiting: prevent API hammering
		if (lastRefreshRecord?.lastUpdated) {
			const timeSinceLastRefresh = now - lastRefreshRecord.lastUpdated;
			if (timeSinceLastRefresh < REFRESH_COOLDOWN) {
				const waitTime = Math.ceil((REFRESH_COOLDOWN - timeSinceLastRefresh) / 60000);
				throw new Error(`Please wait ${waitTime} minutes before refreshing again`);
			}
		}

		// Update the timestamp in Convex for rate limiting first
		await convex.mutation(api.migrate.upsertCacheTracking, {
			dataType: "transfers",
			source: "football-api",
			lastUpdated: now,
		});

		// Update the cache tag using Next.js updateTag for immediate refresh
		updateTag("transfers");

		// Fetch fresh data after cache invalidation for read-your-writes
		const freshData = await getCachedTransferData();

		return { success: true, message: "Transfer data refreshed immediately", data: freshData };
	} catch (error) {
		console.error("Failed to refresh transfer data:", error);
		throw error;
	}
}
