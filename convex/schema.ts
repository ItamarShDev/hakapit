import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_name", ["name"])
  .index("by_title", ["title"]);

export const episodes = defineTable({
  episodeNumber: v.number(),
  guid: v.optional(v.string()),
  title: v.string(),
  link: v.optional(v.string()),
  description: v.optional(v.string()),
  htmlDescription: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  audioUrl: v.string(),
  publishedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  duration: v.optional(v.string()),
  podcastId: v.id("podcasts"),
})
  .index("by_podcastId", ["podcastId"])
  .index("by_podcastId_and_number", ["podcastId", "episodeNumber"]);

export const cacheTracking = defineTable({
  dataType: v.string(),
  lastUpdated: v.number(),
  expiresAt: v.optional(v.number()),
  source: v.string(),
  metadata: v.optional(v.string()),
  payload: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_dataType", ["dataType"]);

export const transfers = defineTable({
  playerId: v.number(),
  playerName: v.string(),
  playerPhoto: v.optional(v.string()),
  date: v.number(),
  teamId: v.number(),
  teamName: v.string(),
  teamLogo: v.optional(v.string()),
  type: v.optional(v.string()),
  direction: v.string(),
  action: v.string(),
  price: v.optional(v.string()),
  updatedAt: v.number(),
})
  .index("by_playerId", ["playerId"])
  .index("by_teamId", ["teamId"])
  .index("by_direction", ["direction"])
  .index("by_action", ["action"]);

export default defineSchema({
  podcasts,
  episodes,
  cacheTracking,
  transfers,
});
