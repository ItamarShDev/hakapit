import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const cacheTracking = pgTable("cache_tracking", {
	id: serial("id").primaryKey(),
	dataType: text("data_type").notNull().unique(),
	lastUpdated: timestamp("last_updated").defaultNow().notNull(),
	expiresAt: timestamp("expires_at"),
	source: text("source").notNull(), // e.g., 'rss', 'football-api'
	metadata: text("metadata"), // optional metadata as JSON string
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cacheTrackingRelations = relations(cacheTracking, () => ({}));

export type CacheTracking = typeof cacheTracking.$inferSelect;
export type CacheTrackingInsert = typeof cacheTracking.$inferInsert;
