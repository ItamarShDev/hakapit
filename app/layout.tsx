"use client";
import type { Metadata } from "next";
import { useEffect } from "react";
import { AnalyticsWrapper } from "~/components/analytics";
import { NavigationProgress } from "./components/navigation-progress";
import { RootLayoutProvider } from './RootLayoutProvider';
import "./globals.css";
import "./styles.css";

export const metadata: Metadata = {
	manifest: "/manifest.ts",
	themeColor: "#000000",
	icons: {
		icon: [
			"/favicon.ico",
			{ url: "/icon.svg", type: "image/svg+xml" },
			{ url: "/icon.png", sizes: "96x96", type: "image/png" },
			{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
	},
	authors: { name: "משפחת הכפית", url: "https://hakapit.online" },
	openGraph: {
		type: "website",
		url: "https://hakapit.online",
		title: "הכפית",
		description: "אתר הבית של משפחת הכפית",
		images: [{ url: "https://hakapit.online/logo.webp" }],
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			window.addEventListener("load", () => {
				navigator.serviceWorker
					.register("/sw.js")
					.then((registration) => {
						console.log("Service Worker registered with scope:", registration.scope);
					})
					.catch((error) => {
						console.error("Service Worker registration failed:", error);
					});
			});
		}
	}, []);

	return (
		<html lang="he">
			<head>
				<meta name="apple-mobile-web-app-title" content="הכפית" />
			</head>
			<body>
				<NavigationProgress />
				<RootLayoutProvider>
					<RootLayoutProvider>
						{children}
					</RootLayoutProvider>
				</RootLayoutProvider>
				<AnalyticsWrapper />
			</body>
		</html>
	);
}
