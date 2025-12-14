import { api } from "convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import webpush from "web-push";

// Initialize Convex client
const convexUrl = process.env.CONVEX_URL || import.meta.env.CONVEX_URL;
if (!convexUrl) {
	throw new Error("CONVEX_URL environment variable is required");
}
const convex = new ConvexHttpClient(convexUrl);

export async function sendNotification(userId: string, title: string, message: string) {
	const subscription = await convex.query(api.subscriptions.getSubscriptionByUserId, { userId });
	if (!subscription) {
		throw new Error("No subscription available");
	}

	try {
		await webpush.sendNotification(
			subscription.subscription,
			JSON.stringify({
				title,
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

export async function notifyAllUsers(message: string) {
	const users = await convex.query(api.subscriptions.getAllSubscriptions);
	for (const user of users) {
		await sendNotification(user.userId, "רכש חדש!", message);
	}
}
