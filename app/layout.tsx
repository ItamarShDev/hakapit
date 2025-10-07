import type { Metadata, Viewport } from "next";
import { AnalyticsWrapper } from "~/components/analytics";
import { NavigationProgress } from "./components/navigation-progress";
import "./globals.css";
import "./styles.css";
export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1.0,
	themeColor: "var(--color-primary)",
	colorScheme: "dark light",
};

export const metadata: Metadata = {
	manifest: "/manifest.ts",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="he" suppressHydrationWarning>
			<head>
				<meta name="apple-mobile-web-app-title" content="הכפית" />
			</head>
			<body className="hakapit" suppressHydrationWarning>
				<NavigationProgress />
				{children}
				<AnalyticsWrapper />
			</body>
		</html>
	);
}
