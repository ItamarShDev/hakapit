import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { podcasts } from "~/db/schema";
import type { PodcastName } from "~/providers/rss/feed";
import type { EpisodeData } from "~/providers/rss/types";
import { toDate } from "~/utils";

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

export type Episode = typeof episodes.$inferSelect;

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
