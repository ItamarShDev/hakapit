import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { MainLayout } from "~/app/layouts/main";
import { PlayerProvider } from "~/app/layouts/Player/provider";
import type { PodcastName } from "~/app/providers/rss/feed";
import { validatePodcastParam } from "~/app/utils/validatie-podcast-param";
import ConvexProvider from "../integrations/convex/provider";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
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
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			{
				name: "twitter:title",
				content: "הכפית",
			},
			{
				name: "twitter:description",
				content: "אתר הבית של משפחת הכפית",
			},
			{
				name: "twitter:image",
				content: "https://hakapit.online/logo.webp",
			},
			{
				name: "twitter:url",
				content: "https://hakapit.online",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	// Use useRouterState to get the podcast from the matched route params
	// This works correctly during SSR unlike useParams in shellComponent
	const podcast = useRouterState({
		select: (state) => {
			// Find the podcast param from matched routes
			for (const match of state.matches) {
				const params = match.params as { podcast?: string };
				if (params.podcast && validatePodcastParam(params.podcast)) {
					return params.podcast;
				}
			}
			return "hakapit";
		},
	});

	return (
		<html lang="he">
			<head>
				<HeadContent />
			</head>
			<body className={podcast}>
				<ConvexProvider>
					<MainLayout params={{ podcast: podcast as PodcastName }}>
						<PlayerProvider>{children}</PlayerProvider>
					</MainLayout>
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							TanStackQueryDevtools,
						]}
					/>
				</ConvexProvider>
				{import.meta.env.PROD && (
					<>
						<Analytics />
						<SpeedInsights />
					</>
				)}
				<Scripts />
			</body>
		</html>
	);
}
