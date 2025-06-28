"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { subscribeUser, unsubscribeUser } from "~/actions/push";

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

	// biome-ignore lint/correctness/useExhaustiveDependencies: no need to pass registerServiceWorker to useEffect
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
					minInterval: 6 * 60 * 60 * 1000, // 1 hour in ms
				});
				// @ts-ignore
				await serviceWorkerRegistration.periodicSync.register("new-transfers", {
					minInterval: 60 * 60 * 1000, // 3 hours in ms
				});
				setSubscription(sub);
			} catch (e) {
				console.error(e);
			}
		}
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

	return {
		isSupported,
		subscription,
		subscribeToPush,
		unsubscribeFromPush,
	};
}

export function PushNotificationManager() {
	const { isSupported, subscription, subscribeToPush, unsubscribeFromPush } = usePushNotifications();

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
				<Button type="button" variant="link" className="text-accent h-0" onClick={unsubscribeFromPush}>
					ביטול הרשמה
				</Button>
			) : (
				<Button type="button" variant="link" className="text-accent h-0" onClick={subscribeToPush}>
					הרשמה להתראות
				</Button>
			)}
		</div>
	);
}
function useInstallPrompt() {
	const [isIOS, setIsIOS] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);
	const [installPrompt, setInstallPrompt] = useState<any>(null);

	useEffect(() => {
		// biome-ignore lint/suspicious/noExplicitAny: no need to pass window to useEffect
		setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
		setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
	}, []);

	useEffect(() => {
		window.addEventListener("beforeinstallprompt", (e) => {
			setInstallPrompt(e);
		});
		window.addEventListener("appinstalled", () => {
			setInstallPrompt(null);
		});
	}, []);

	return { isIOS, isStandalone, installPrompt };
}

export function InstallPrompt() {
	const { isIOS, isStandalone, installPrompt } = useInstallPrompt();

	if (isStandalone || isIOS || !installPrompt) {
		return null; // Don't show install button if already installed
	}

	return (
		<div>
			<span className="text-accent">|</span>
			<Button type="button" variant="link" className="text-accent h-0" onClick={() => installPrompt?.prompt()}>
				הוספה למסך הבית
			</Button>
		</div>
	);
}
