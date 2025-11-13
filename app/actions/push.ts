"use server";

import { ConvexHttpClient } from "convex/browser";
import webpush from "web-push";
import { api } from "~/convex/_generated/api";

// Initialize Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
	throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is required");
}
const convex = new ConvexHttpClient(convexUrl);

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
	webpush.setVapidDetails(
		"mailto:itamarsharify@gmail.com",
		process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
		process.env.VAPID_PRIVATE_KEY,
	);
}

export async function subscribeUser(sub: PushSubscription) {
	// Create or update subscription
	await convex.mutation(api.subscriptions.upsertSubscription, {
		podcast: "hakapit", // Default podcast for push notifications
		userId: sub.endpoint,
		subscription: sub,
	});

	return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
	await convex.mutation(api.subscriptions.deleteSubscription, {
		userId: endpoint,
	});
	return { success: true };
}
