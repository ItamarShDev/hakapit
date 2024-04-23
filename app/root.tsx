import { cn } from "@/lib/utils";
import type { LinksFunction } from "@remix-run/node";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useParams } from "@remix-run/react";
import { useEffect } from "react";
import { AnalyticsWrapper } from "~/components/analytics";
import Header from "~/components/header";
import { PlayerProvider } from "~/components/player/provider";
import styles from "~/styles/tailwind.css?url";

export const shouldRevalidate: ShouldRevalidateFunction = ({ currentUrl, nextUrl }) => {
	return currentUrl !== nextUrl;
};

export const links: LinksFunction = () => {
	const links = [
		{ rel: "stylesheet", href: styles },
		{
			rel: "stylesheet",
			href: "https://fonts.googleapis.com/css2?family=Heebo&family=Amatic+SC&family=Rubik+80s+Fade&family=Rubik+Moonrocks&family=Karantina:wght@300&display=swap",
		},
	];
	return links;
};

export function ScriptTwitter({ id }: { id: string }) {
	useEffect(() => {
		document.getElementById("twitter-wjs")?.remove();
		const scriptTag = document.createElement("script");
		scriptTag.id = "twitter-wjs";
		scriptTag.src = `https://platform.twitter.com/widgets.js?v=${id}`;
		document.body.appendChild(scriptTag);
	}, [id]);
	return null;
}

export function App() {
	const params = useParams();
	const podcast = params.podcast;
	const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<ScriptTwitter id={id} />
				<Meta />
				<Links />
			</head>
			<body className={cn("body", podcast)}>
				<Header
					data={{
						imageUrl:
							"https://storage.pinecast.net/podcasts/covers/29ae23b9-9411-48e0-a947-efd71e9e82ea/Kapit_Logo_Red_Background.jpg",
						title: "הכפית",
					}}
					podcast={podcast}
				/>
				<PlayerProvider>
					<main className="main-content">
						<Outlet />
					</main>
				</PlayerProvider>
				<ScrollRestoration />
				<Scripts />
				<AnalyticsWrapper />
			</body>
		</html>
	);
}

export default App;
