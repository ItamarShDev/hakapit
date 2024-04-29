import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { toDate } from "~/hooks";
import type { PodcastName } from "~/server/rss/feed";
import type { EpisodeData, Feed } from "~/server/rss/types";

export const podcasts = pgTable("podcast", {
	id: serial("id").primaryKey(),
	name: text("name").notNull().unique(),
	title: text("title").notNull().unique(),
	link: text("link"),
	description: text("description"),
	imageUrl: text("image_url"),
	feedUrl: text("feed_url"),
	authorName: text("author_name"),
	authorEmail: text("author_email"),
	authorSummary: text("author_summary"),
	authorImageUrl: text("author_image_url"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const episodes = pgTable("episode", {
	id: serial("id").primaryKey(),
	episodeNumber: integer("episode_number").notNull(),
	guid: text("guid").unique(),
	title: text("title").notNull(),
	link: text("link"),
	description: text("description"),
	htmlDescription: text("html_description"),
	imageUrl: text("image_url"),
	audioUrl: text("audio_url").notNull(),
	publishedAt: timestamp("published_at"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	duration: text("duration"),
	podcast: text("podcast_name"),
});
export const podcastRelations = relations(podcasts, ({ many }) => ({
	episodes: many(episodes),
}));

export const episodeRelations = relations(episodes, ({ one }) => ({
	podcast: one(podcasts, {
		fields: [episodes.podcast],
		references: [podcasts.name],
	}),
}));

export function toSchemaEpisode(episode: EpisodeData, podcastName: PodcastName): typeof episodes.$inferInsert {
	return {
		title: episode.title,
		guid: episode.episodeGUID,
		link: episode.link,
		description: episode.contentSnippet,
		htmlDescription: episode.content,
		imageUrl: episode.itunes.image,
		audioUrl: episode.enclosure?.url,
		publishedAt: toDate(episode.isoDate),
		duration: episode.itunes.duration,
		episodeNumber: episode.number,
		podcast: podcastName,
		updatedAt: new Date(),
		createdAt: new Date(),
	};
}

export function toSchemaPodcast(feed: Feed, podcastName: PodcastName): typeof podcasts.$inferInsert {
	return {
		name: podcastName,
		title: feed.title,
		link: feed.link,
		feedUrl: feed.feedUrl,
		description: feed.description,
		imageUrl: feed.itunes.image,
		authorName: feed.itunes.owner?.name,
		authorEmail: feed.itunes.owner?.email,
		authorSummary: feed.itunes.summary,
		authorImageUrl: feed.itunes.image,
		updatedAt: new Date(),
		createdAt: new Date(),
	};
}
