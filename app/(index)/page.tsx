import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { NextMatchOverview } from "~/components/next-match";
import { StatsTable } from "~/components/stats/stats";
import { Trophies } from "~/components/stats/trophies";
import { getLeagues, getTeam } from "~/server/fotmob-api";
export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1.0,
	themeColor: "currentColor",
};
export const metadata: Metadata = {
	title: "הכפית",
	icons: "/logo.webp",
	description: "אתר הבית של משפחת הכפית",
	authors: { name: "משפחת הכפית", url: "https://hakapit.online" },
	openGraph: {
		type: "website",
		url: "https://hakapit.online",
		title: "הכפית",
		description: "אתר הבית של משפחת הכפית",
		images: [{ url: "https://hakapit.online/logo.webp" }],
	},
};

async function getTeams() {
	const teamData = await getTeam();
	const nextGame = teamData?.overview?.nextMatch;
	const nextMatchOpponent = await getTeam(nextGame?.opponent?.id);
	return { teamData, nextMatchOpponent };
}

const loader = async () => {
	const leaguesIds = await getLeagues(47);
	const { teamData, nextMatchOpponent } = await getTeams();
	return {
		teamData,
		nextMatchOpponent,
		leaguesIds,
	};
};

export default async function Index() {
	const { teamData, nextMatchOpponent, leaguesIds } = await loader();
	return (
		<section className="flex flex-col items-center justify-center h-full py-4 text-center lg:about lg:py-0">
			<div className="flex flex-col w-full gap-10">
				<Trophies teamData={teamData} />
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<div className="text-2xl fade-in-bottom text-accent">מה זה כפית?</div>
						</TooltipTrigger>
						<TooltipContent side="bottom" className="rounded-xl bg-primary border-accent">
							<div className="what-is-kapit text-slate-300 py-2">
								<p className="fade-in-bottom a-delay-100">כפית זה משחק של אופי.</p>
								<p className="fade-in-bottom a-delay-400">כפית זה ניצחון ברגע האחרון.</p>
								<p className="fade-in-bottom a-delay-700">כפית זה כל כך פשוט וכל כך קשה.</p>
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<Suspense fallback={<>...</>}>
					<NextMatchOverview nextMatchOpponent={nextMatchOpponent} teamData={teamData} />
				</Suspense>
				<Suspense fallback={<>...</>}>
					<StatsTable leaguesIds={leaguesIds} />
				</Suspense>
			</div>

			<div className="flex flex-wrap justify-center gap-2 py-4">
				<Link href="https://twitter.com/KapitPod">Twitter</Link>
				<span className="text-accent">|</span>
				<Link href="https://www.threads.net/@kapitpod">Threads</Link>
				<span className="text-accent">|</span>
				<Link href="https://www.facebook.com/KapitPod">Facebook</Link>
				<span className="text-accent">|</span>
				<Link href="https://www.instagram.com/kapitpod/">Instagram</Link>
				<span className="text-accent">|</span>
				<Link href="https://pod.link/1546442506">Pod.link</Link>
			</div>
		</section>
	);
}
