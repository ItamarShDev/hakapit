import { serial, text, timestamp, pgTable } from "drizzle-orm/pg-core";

export const posts = pgTable("post", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content"),
    image_url: text("image_url"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});