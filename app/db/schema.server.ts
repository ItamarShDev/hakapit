import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { EpisodeData } from "~/api/rss/types";
import { toDate } from "~/hooks";

export const posts = pgTable("post", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	content: text("content"),
	image_url: text("image_url"),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

export const episodes = pgTable("episode", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	link: text("link").notNull(),
	description: text("description"),
	imageUrl: text("image_url"),
	audioUrl: text("audio_url").notNull(),
	publishedAt: timestamp("published_at"),
	createdAt: timestamp("created_at"),
	duration: text("duration"),
	updatedAt: timestamp("updated_at"),
});

export const podcasts = pgTable("podcast", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	link: text("link").notNull(),
	description: text("description"),
	imageUrl: text("image_url"),
	feedUrl: text("feed_url"),
	authorName: text("author_name"),
	authorEmail: text("author_email"),
	authorSummary: text("author_summary"),
	authorImageUrl: text("author_image_url"),
	episodes: integer("episodes").references(() => episodes.id),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

export function toSchemaEpisode(episode: EpisodeData): typeof episodes.$inferInsert {
	return {
		title: episode.title,
		link: episode.link,
		description: episode.contentSnippet,
		imageUrl: episode.imageUrl,
		audioUrl: episode.audioUrl,
		publishedAt: toDate(episode.isoDate),
		duration: episode.duration,
	};
}
