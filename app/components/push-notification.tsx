"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { sendNotification, subscribeUser, unsubscribeUser } from "~/actions/push";

function urlBase64ToUint8Array(base64String: string) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

function usePushNotifications() {
	const [isSupported, setIsSupported] = useState(false);
	const [subscription, setSubscription] = useState<PushSubscription | null>(null);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if ("serviceWorker" in navigator && "PushManager" in window) {
			setIsSupported(true);
			registerServiceWorker();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function registerServiceWorker() {
		const registration = await navigator.serviceWorker.register("/sw.js", {
			scope: "/",
			updateViaCache: "none",
		});
		const sub = await registration.pushManager.getSubscription();
		const serviceWorkerRegistration = await navigator.serviceWorker.ready;
		if ("periodicSync" in serviceWorkerRegistration) {
			try {
				// @ts-ignore
				await serviceWorkerRegistration.periodicSync.register("fetch-latest-episode", {
					minInterval: 60 * 60 * 1000, // 1 hour in ms
				});
			} catch (e) {
				// handle error or fallback
			}
		}
		setSubscription(sub);
	}

	async function subscribeToPush() {
		if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
			throw new Error("VAPID public key not found");
		}
		const registration = await navigator.serviceWorker.ready;
		const sub = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
		});
		setSubscription(sub);
		const serializedSub = JSON.parse(JSON.stringify(sub));
		await subscribeUser(serializedSub);
	}

	async function unsubscribeFromPush() {
		if (subscription) {
			await subscription.unsubscribe();
			await unsubscribeUser(subscription.endpoint);
			setSubscription(null);
		}
	}

	async function sendTestNotification() {
		if (subscription) {
			await sendNotification(subscription.endpoint, message);
			setMessage("");
		}
	}

	return {
		isSupported,
		subscription,
		message,
		setMessage,
		subscribeToPush,
		unsubscribeFromPush,
		sendTestNotification,
	};
}

function PushNotificationManager() {
	const { isSupported, subscription, message, setMessage, subscribeToPush, unsubscribeFromPush, sendTestNotification } =
		usePushNotifications();

	// biome-ignore lint/correctness/useExhaustiveDependencies:  subscribeToPush
	useEffect(() => {
		subscribeToPush();
	}, []);

	if (!isSupported) {
		return null;
	}

	return (
		<div>
			{subscription ? (
				<>
					<Button type="button" onClick={unsubscribeFromPush}>
						Unsubscribe
					</Button>
					<input
						type="text"
						placeholder="Enter notification message"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
					<Button type="button" onClick={sendTestNotification}>
						Send Test
					</Button>
				</>
			) : (
				<>
					<Button type="button" onClick={subscribeToPush}>
						הרשמה
					</Button>
				</>
			)}
		</div>
	);
}
function useInstallPrompt() {
	const [isIOS, setIsIOS] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);

	useEffect(() => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
		setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
	}, []);

	return { isIOS, isStandalone };
}

function InstallPrompt() {
	const { isIOS, isStandalone } = useInstallPrompt();

	if (isStandalone) {
		return null; // Don't show install button if already installed
	}

	return (
		<div>
			<Button type="button">Add to Home Screen</Button>
			{isIOS && (
				<p>
					To install this app on your iOS device, tap the share button
					<span role="img" aria-label="share icon">
						{" "}
						⎋{" "}
					</span>
					and then "Add to Home Screen"
					<span role="img" aria-label="plus icon">
						{" "}
						➕{" "}
					</span>
					.
				</p>
			)}
		</div>
	);
}

export function PushNotifications() {
	return (
		<div>
			<PushNotificationManager />
			<InstallPrompt />
		</div>
	);
}
