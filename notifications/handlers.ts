import { eq } from "drizzle-orm";
import webpush from "web-push";
import { db } from "~/db/config";
import { subscriptions } from "~/db/schema";

export async function sendNotification(userId: string, title: string, message: string) {
	const subscription = await db.query.subscriptions.findFirst({
		where: eq(subscriptions.userId, userId),
	});
	if (!subscription) {
		throw new Error("No subscription available");
	}

	try {
		await webpush.sendNotification(
			// @ts-ignore
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
	const users = await db.select().from(subscriptions);
	for (const user of users) {
		await sendNotification(user.userId, "רכש חדש!", message);
	}
}
