import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts, useParams } from "@tanstack/react-router";
import { MainLayout } from "~/app/layouts/main";
import { PlayerProvider } from "~/app/layouts/Player/provider";
import type { PodcastName } from "~/app/providers/rss/feed";
import appCss from "./styles.css?url";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1.0",
			},
			{
				name: "theme-color",
				content: "var(--color-primary)",
			},
			{
				name: "color-scheme",
				content: "dark light",
			},
			{ title: "הכפית" },
			{
				name: "description",
				content: "אתר הבית של משפחת הכפית",
			},
			{
				name: "author",
				content: "משפחת הכפית",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:url",
				content: "https://hakapit.online",
			},
			{
				property: "og:title",
				content: "הכפית",
			},
			{
				property: "og:description",
				content: "אתר הבית של משפחת הכפית",
			},
			{
				property: "og:image",
				content: "https://hakapit.online/logo.webp",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest",
			},
			{
				rel: "icon",
				href: "/favicon.ico",
			},
			{
				rel: "icon",
				href: "/icon.svg",
				type: "image/svg+xml",
			},
			{
				rel: "icon",
				href: "/icon.png",
				sizes: "96x96",
				type: "image/png",
			},
			{
				rel: "icon",
				href: "/icon-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				rel: "icon",
				href: "/icon-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-icon.png",
				sizes: "180x180",
				type: "image/png",
			},
		],
	}),
	notFoundComponent: () => {
		return (
			<section className="flex flex-col items-center justify-center h-full py-10 text-center gap-3">
				<h1 className="text-2xl font-bold">לא נמצא</h1>
				<p className="text-sm text-muted-foreground">העמוד שחיפשת לא קיים.</p>
			</section>
		);
	},
	component: RootLayout,
});

function RootLayout() {
	const { podcast = "hakapit" } = useParams({ strict: false });
	return (
		<html lang="he">
			<head>
				<HeadContent />
			</head>
			<body className={podcast}>
				<MainLayout params={{ podcast: podcast as PodcastName }}>
					<PlayerProvider>
						<Outlet />
						<Scripts />
						<TanStackDevtools />
					</PlayerProvider>
				</MainLayout>
			</body>
		</html>
	);
}
