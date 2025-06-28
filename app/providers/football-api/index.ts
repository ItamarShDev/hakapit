"use server";
import { desc } from "drizzle-orm";

import { db } from "~/db/config";
import { transfers } from "~/db/schema";
import { baseUrl, LiverpoolId } from "~/providers/football-api/constants";
import type { PlayerStatsResponse } from "~/providers/football-api/types/player-stats";
import type { TransferResponse } from "~/providers/football-api/types/transfer";

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
	const results = await getTransferData();
	// const newTransfers = results.filter((result) => result.updatedAt.getTime() === Date.now());
	const transfersPerPlayer = Object.fromEntries(results.map((result) => [result.playerName, result]));
	return transfersPerPlayer;
}

export async function getTransferData() {
	// get last update from transfers db
	const lastUpdate = await db.select().from(transfers).orderBy(desc(transfers.updatedAt)).limit(1);
	// if last update is today, return db data
	if (lastUpdate[0]?.updatedAt.toDateString() === new Date().toDateString()) {
		return await db.select().from(transfers);
	}
	const data = await fetchData<TransferResponse>("transfers", { team: String(LiverpoolId) });
	const onlyTransfersFromLastYear = [];
	for (const transferItem of data.response.sort(
		(a, b) => new Date(b.update).getTime() - new Date(a.update).getTime(),
	)) {
		const isCurrentYear = transferItem.transfers.some(
			(transfer) => new Date(transfer.date).getFullYear() === new Date().getFullYear(),
		);
		const isBuy = transferItem.transfers.every(
			(transfer) =>
				transfer.teams.in.id === LiverpoolId &&
				transfer.type !== "Loan" &&
				transfer.type !== null &&
				transfer.type !== "N/A",
		);
		if (isCurrentYear && isBuy) {
			const player = await getPlayerData(transferItem.player.id);
			const transferDTO = {
				updatedAt: new Date(),
				playerId: transferItem.player.id,
				date: new Date(transferItem.update),
				teamId: transferItem.transfers[0].teams.out.id,
				type: transferItem.transfers[0].type,
				playerName: transferItem.player.name,
				playerPhoto: player.response[0].player.photo,
				teamName: transferItem.transfers[0].teams.out.name,
				teamLogo: transferItem.transfers[0].teams.out.logo,
			};
			onlyTransfersFromLastYear.push(transferDTO);
		}
	}

	// upsert transfers by player_id
	db.insert(transfers).values(onlyTransfersFromLastYear).onConflictDoNothing({ target: transfers.playerId }).execute();
	return onlyTransfersFromLastYear;
}

async function getPlayerData(playerId: number) {
	return await fetchData<PlayerStatsResponse>("players/profiles", { player: String(playerId) });
}
