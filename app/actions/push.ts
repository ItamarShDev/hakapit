"use server";

import { eq } from "drizzle-orm";
import webpush from "web-push";
import { db } from "~/db/config";
import { subscriptions, toSubscriptionSchema } from "~/db/schema";
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
	console.log("VAPID keys set", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
	webpush.setVapidDetails(
		"mailto:itamarsharify@gmail.com",
		process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
		process.env.VAPID_PRIVATE_KEY,
	);
}

export async function subscribeUser(sub: PushSubscription) {
	await db.insert(subscriptions).values(toSubscriptionSchema(sub)).execute();
	return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
	await db.delete(subscriptions).where(eq(subscriptions.userId, endpoint)).execute();
	return { success: true };
}

export async function sendNotification(endpoint: string, message: string) {
	const subscription = await db.query.subscriptions.findFirst({
		where: eq(subscriptions.userId, endpoint),
	});
	if (!subscription) {
		throw new Error("No subscription available");
	}

	try {
		console.log(subscription.subscription);
		const result = await webpush.sendNotification(
			// @ts-ignore
			subscription.subscription,
			JSON.stringify({
				title: "Test Notification",
				body: message,
				icon: "/icon.png",
			}),
		);
		return { success: true };
	} catch (error) {
		console.error("Error sending push notification:", error);
		return { success: false, error: "Failed to send notification" };
	}
}
