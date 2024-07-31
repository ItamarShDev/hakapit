import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { NextMatchOverview } from "~/components/next-match";
import { StatsTable } from "~/components/stats/stats";
import { Trophies } from "~/components/stats/trophies";

export const revalidate = 60;

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

export default async function Index() {
	return (
		<section className="lg:about lg:py-0 flex flex-col items-center justify-center h-full py-4 text-center">
			<div className="flex flex-col w-full gap-10">
				<Trophies />
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<div className="fade-in-bottom text-accent text-2xl">מה זה כפית?</div>
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
