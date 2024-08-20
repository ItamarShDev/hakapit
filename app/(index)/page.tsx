import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { QuestionMarkIcon } from "@radix-ui/react-icons";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { NextMatchOverview } from "~/components/next-match";
import { LastEpisodeCardPreview } from "~/components/rss/EpisodeCard";
import { StatsTable } from "~/components/stats/stats";
import { Trophies } from "~/components/stats/trophies";
import { fetchUpdatedFeed } from "~/server/rss/feed";

// export const revalidate = 60;

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
async function LatestEpisode() {
	const data = await fetchUpdatedFeed("hakapit", 1);
	if (!data) {
		return null;
	}
	return <LastEpisodeCardPreview episode={data.episodes[0]} />;
}
function WhatIsKapit() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger className=" flex items-center gap-2">
					<QuestionMarkIcon className="text-accent border-accent w-5 h-5 p-1 border rounded-full" />
					<div className="text-accent text-sm">מה זה כפית</div>
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
	);
}

export default async function Index() {
	return (
		<section className="lg:about lg:py-0 flex flex-col items-center justify-center h-full py-4 text-center">
			<div className="flex flex-col w-full gap-10">
				<Trophies />
				<div className="flex flex-wrap justify-between">
					<LatestEpisode />
					<WhatIsKapit />
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
