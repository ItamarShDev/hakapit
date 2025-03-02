import type { Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { NextMatchOverview } from "~/components/next-match";
import { LastEpisodeCardPreview } from "~/components/rss/EpisodeCard";
import { StatsTable } from "~/components/stats/stats";
import { Trophies } from "~/components/stats/trophies";
import { fetchLatestEpisode } from "~/server/rss/feed";

export const revalidate = 300; // 5 minutes

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1.0,
	themeColor: "var(--color-primary)",
	colorScheme: "dark light",
};

async function LatestEpisode() {
	const episode = await fetchLatestEpisode("hakapit");
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
				<NextMatchOverview />
				<StatsTable />
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
