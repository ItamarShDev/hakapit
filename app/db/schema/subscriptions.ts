import { json, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const subscriptions = pgTable("subscription", {
	id: serial("id").primaryKey(),
	podcast: text("podcast").notNull(),
	userId: text("user_id").notNull().unique(),
	expirationTime: timestamp("expiration_time"),
	subscription: json("subscription").$type<PushSubscription>().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export function toSubscriptionSchema(sub: PushSubscription): typeof subscriptions.$inferInsert {
	return {
		podcast: "hakapit",
		userId: sub.endpoint,
		expirationTime: sub.expirationTime ? new Date(sub.expirationTime) : null,
		subscription: sub,
	};
}
