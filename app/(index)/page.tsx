import type { Viewport } from "next";
import { Suspense } from "react";
import { FloatingChat } from "~/components/chat/FloatingChat";
import { LatestEpisode } from "~/components/convex/LatestEpisode";
import { RecentTransfers } from "~/components/convex/RecentTransfers";
import { NextMatchOverview } from "~/components/next-match";
import { StatsTable } from "~/components/stats/stats";
import { Trophies } from "~/components/stats/trophies";

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1.0,
	themeColor: "var(--color-primary)",
	colorScheme: "dark light",
};

export default function Index() {
	return (
		<section className="lg:about lg:py-0 flex flex-col items-center justify-center h-full py-4 text-center">
			<div className="flex flex-col w-full gap-10">
				<Trophies />
				<div className="flex flex-wrap justify-center">
					<LatestEpisode />
				</div>
				<div className="flex flex-wrap justify-center">
					<RecentTransfers />
				</div>
				<NextMatchOverview />
				<StatsTable />
			</div>
			<Suspense fallback={null}>
				<FloatingChat />
			</Suspense>
		</section>
	);
}
