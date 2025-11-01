import type { Viewport } from "next";
import { cache, Suspense } from "react";
import { FloatingChat } from "~/components/chat/FloatingChat";
import { NextMatchOverview } from "~/components/next-match";
import { LastEpisodeCardPreview } from "~/components/rss/EpisodeCard";
import { StatsTable } from "~/components/stats/stats";
import { Trophies } from "~/components/stats/trophies";
import { fetchLatestEpisode } from "~/providers/rss/feed";
import { RecentTransfers } from "./RecentTransfers";

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1.0,
	themeColor: "var(--color-primary)",
	colorScheme: "dark light",
};

const getLatestEpisode = cache(fetchLatestEpisode);

async function LatestEpisode() {
	const episode = await getLatestEpisode("hakapit");
	if (!episode) {
		return null;
	}
	return <LastEpisodeCardPreview episode={episode} />;
}

export default async function Index() {
	return (
		<section className="lg:about lg:py-0 flex flex-col items-center justify-center h-full py-4 text-center">
			<div className="flex flex-col w-full gap-10">
				<Trophies />
				<div className="flex flex-wrap justify-center">
					<Suspense
						fallback={
							<div className="size-[88px] text-center  vertical-align-middle  text-slate-700 italic ">טוען פרק</div>
						}
					>
						<LatestEpisode />
					</Suspense>
				</div>
				<div className="flex flex-wrap justify-center">
					<Suspense
						fallback={
							<div className="size-[88px] text-center  vertical-align-middle  text-slate-700 italic ">טוען העברות</div>
						}
					>
						<RecentTransfers />
					</Suspense>
				</div>
				<NextMatchOverview />
				<StatsTable />
			</div>
			<FloatingChat />
		</section>
	);
}
