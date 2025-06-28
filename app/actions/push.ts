"use server";

import { eq } from "drizzle-orm";
import webpush from "web-push";
import { db } from "~/db/config";
import { subscriptions, toSubscriptionSchema } from "~/db/schema";

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
	webpush.setVapidDetails(
		"mailto:itamarsharify@gmail.com",
		process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
		process.env.VAPID_PRIVATE_KEY,
	);
}

export async function subscribeUser(sub: PushSubscription) {
	const existing = await db.query.subscriptions.findFirst({
		where: eq(subscriptions.userId, sub.endpoint),
	});
	if (existing) {
		await db
			.update(subscriptions)
			.set(toSubscriptionSchema(sub))
			.where(eq(subscriptions.userId, sub.endpoint))
			.execute();
	} else {
		await db.insert(subscriptions).values(toSubscriptionSchema(sub)).execute();
	}
	return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
	await db.delete(subscriptions).where(eq(subscriptions.userId, endpoint)).execute();
	return { success: true };
}
