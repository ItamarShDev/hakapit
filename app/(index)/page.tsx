import type { Metadata, Viewport } from "next";
import Link from "next/link";
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
					<LatestEpisode />
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
