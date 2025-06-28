import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import type { Player } from "~/providers/football-api/types/player-stats";
import type { TransferResponse } from "~/providers/football-api/types/transfer";

export const transfers = pgTable("transfer", {
	id: serial("id").primaryKey(),
	playerId: integer("player_id").notNull().unique(),
	playerName: text("player_name").notNull(),
	playerPhoto: text("player_photo"),
	date: timestamp("date").notNull(),
	teamId: integer("team_id").notNull(),
	teamName: text("team_name").notNull(),
	teamLogo: text("team_logo"),
	type: text("type"),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const fetchTime = pgTable("fetch_time", {
	id: serial("id").primaryKey(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const toTransferSchema = (transfer: TransferResponse, player?: Player): typeof transfers.$inferInsert => {
	return {
		playerId: transfer.response[0].player.id,
		playerName: transfer.response[0].player.name,
		playerPhoto: player?.photo,
		date: transfer.response[0].update,
		teamId: transfer.response[0].transfers[0].teams.out.id,
		teamName: transfer.response[0].transfers[0].teams.out.name,
		teamLogo: transfer.response[0].transfers[0].teams.out.logo,
		type: transfer.response[0].transfers[0].type,
	};
};

export type TransferDTO = typeof transfers.$inferSelect;
