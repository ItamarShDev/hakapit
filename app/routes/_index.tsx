import type { LinksFunction } from "@remix-run/node";
import { defer } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { Await, Link, isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { Suspense } from "react";

import { getNextMatchData, getTeamData } from "~/api/sofascore-api/index.server";
import { NextMatchOverview } from "~/components/next-match";

export const meta: MetaFunction = () => [
	{ title: "הכפית" },
	{ charset: "utf-8" },
	{ name: "viewport", content: "width=device-width, initial-scale=1.0" },
	{ name: "description", content: "אתר הבית של משפחת הכפית" },
	{ name: "author", content: "משפחת הכפית" },
	{ name: "image", content: "https://hakapit.online/logo.webp" },
	// open graph

	{ property: "og:type", content: "website" },
	{ property: "og:url", content: "https://hakapit.online" },
	{ property: "og:title", content: "הכפית" },
	{ property: "og:description", content: "אתר הבית של משפחת הכפית" },
	{ property: "og:image", content: "https://hakapit.online/logo.webp" },
	// twitter
	{ property: "twitter:card", content: "summary_large_image" },
	{ property: "twitter:url", content: "https://hakapit.online" },
	{ property: "twitter:title", content: "הכפית" },
	{ property: "twitter:description", content: "אתר הבית של משפחת הכפית" },
	{ property: "twitter:image", content: "https://hakapit.online/logo.webp" },
];

export const links: LinksFunction = () => [
	{
		rel: "icon",
		href: "/logo.webp",
	},
];
async function loadData() {
	const teamData = await getTeamData();

	return { teamData };
}

export const loader = async () => {
	const nextMatch = getNextMatchData();
	return defer({
		nextMatch,
	});
};

export default function Index() {
	const { nextMatch } = useLoaderData<typeof loader>();
	// const nextGame = teamData?.overview?.nextMatch;

	return (
		<section className="flex flex-col items-center justify-center h-full py-4 text-center lg:about lg:py-0">
			<div className="py-8 text-center text-paragraph">
				<h1 className="text-4xl fade-in-bottom text-accent">מה זה כפית?</h1>
				<div className="what-is-kapit text-slate-300">
					<p className="py-2 fade-in-bottom a-delay-100">כפית זה משחק של אופי.</p>
					<p className="py-2 fade-in-bottom a-delay-400">כפית זה ניצחון ברגע האחרון.</p>
					<p className="py-2 fade-in-bottom a-delay-700">כפית זה כל כך פשוט וכל כך קשה.</p>
				</div>
			</div>
			<Suspense fallback={<div>טוען פרטי משחק הבא...</div>}>
				<Await resolve={nextMatch}>{(nextMatch) => <NextMatchOverview nextMatch={nextMatch} />}</Await>
			</Suspense>
			{/* <StatsTable teamData={teamData} leagueStats={leagueStats} /> */}
			<div className="flex flex-wrap justify-center gap-2 py-4">
				<Link to="https://twitter.com/KapitPod">Twitter</Link>
				<span className="text-accent">|</span>
				<Link to="https://www.threads.net/@kapitpod">Threads</Link>
				<span className="text-accent">|</span>
				<Link to="https://www.facebook.com/KapitPod">Facebook</Link>
				<span className="text-accent">|</span>
				<Link to="https://www.instagram.com/kapitpod/">Instagram</Link>
				<span className="text-accent">|</span>
				<Link to="https://pod.link/1546442506">Pod.link</Link>
			</div>
		</section>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();
	if (isRouteErrorResponse(error)) {
		return <div>{error.data.message}</div>;
	}
	return <div />;
}
