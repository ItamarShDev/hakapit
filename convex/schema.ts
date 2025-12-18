import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Podcasts table - RSS podcast data
export const podcasts = defineTable({
	name: v.string(),
	title: v.string(),
	link: v.optional(v.string()),
	description: v.optional(v.string()),
	imageUrl: v.optional(v.string()),
	feedUrl: v.optional(v.string()),
	authorName: v.optional(v.string()),
	authorEmail: v.optional(v.string()),
	authorSummary: v.optional(v.string()),
	authorImageUrl: v.optional(v.string()),
	createdAt: v.number(), // Store as timestamp
	updatedAt: v.number(), // Store as timestamp
})
	.index("by_name", ["name"])
	.index("by_title", ["title"]);

// Episodes table - Podcast episodes
export const episodes = defineTable({
	episodeNumber: v.number(),
	guid: v.optional(v.string()),
	title: v.string(),
	link: v.optional(v.string()),
	description: v.optional(v.string()),
	htmlDescription: v.optional(v.string()),
	imageUrl: v.optional(v.string()),
	audioUrl: v.string(),
	publishedAt: v.optional(v.number()), // Store as timestamp
	createdAt: v.number(),
	updatedAt: v.number(),
	duration: v.optional(v.string()),
	podcastId: v.id("podcasts"), // Reference to podcast document
})
	.index("by_podcastId", ["podcastId"])
	.index("by_podcastId_and_number", ["podcastId", "episodeNumber"]);

// Cache tracking table
export const cacheTracking = defineTable({
	dataType: v.string(),
	lastUpdated: v.number(),
	expiresAt: v.optional(v.number()),
	source: v.string(), // e.g., 'rss', 'football-api'
	metadata: v.optional(v.string()), // optional metadata as JSON string
	payload: v.optional(v.string()), // cached payload serialized as JSON
	createdAt: v.number(),
	updatedAt: v.number(),
}).index("by_dataType", ["dataType"]);

// Subscriptions table - Push notifications
export const subscriptions = defineTable({
	podcast: v.string(),
	userId: v.string(),
	expirationTime: v.optional(v.number()),
	subscription: v.any(), // PushSubscription object
	createdAt: v.number(),
	updatedAt: v.number(),
})
	.index("by_userId", ["userId"])
	.index("by_podcast", ["podcast"]);

// Transfers table - Football player transfers
export const transfers = defineTable({
	playerId: v.number(),
	playerName: v.string(),
	playerPhoto: v.optional(v.string()),
	date: v.number(), // Store as timestamp
	teamId: v.number(),
	teamName: v.string(),
	teamLogo: v.optional(v.string()),
	type: v.optional(v.string()),
	direction: v.string(), // "IN" for transfers to Liverpool, "OUT" for transfers from Liverpool
	action: v.string(), // "BUY" or "SELL" for explicit action tracking
	price: v.optional(v.string()), // Transfer fee amount
	updatedAt: v.number(),
})
	.index("by_playerId", ["playerId"])
	.index("by_teamId", ["teamId"])
	.index("by_direction", ["direction"])
	.index("by_action", ["action"]);

// Fetch time table - Simple timestamp tracking
export const fetchTime = defineTable({
	updatedAt: v.number(),
});

export default defineSchema({
	podcasts,
	episodes,
	cacheTracking,
	subscriptions,
	transfers,
	fetchTime,
});
