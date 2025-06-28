import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { episodes } from "~/db/schema/episodes";
import type { PodcastName } from "~/providers/rss/feed";
import type { Feed } from "~/providers/rss/types";

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

export const podcastRelations = relations(podcasts, ({ many }) => ({
	episodes: many(episodes),
}));

export function toSchemaPodcast(feed: Feed, podcastName: PodcastName): typeof podcasts.$inferInsert {
	return {
		name: podcastName,
		title: feed.title,
		link: feed.link,
		feedUrl: feed.feedUrl,
		description: feed.description,
		imageUrl: feed.itunes?.image,
		authorName: feed.itunes?.owner?.name,
		authorEmail: feed.itunes?.owner?.email,
		authorSummary: feed.itunes?.summary,
		authorImageUrl: feed.itunes?.image,
		updatedAt: new Date(),
		createdAt: new Date(),
	};
}
