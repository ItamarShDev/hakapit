import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { Suspense } from "react";
import { FloatingChat } from "~/app/components/chat/FloatingChat";
import { LatestEpisode } from "~/app/components/convex/LatestEpisode";
import { RecentTransfers } from "~/app/components/convex/RecentTransfers";
import { FullBleed, NextMatchOverview } from "~/app/components/next-match";
import { StatsTable } from "~/app/components/stats/stats";
import { Trophies } from "~/app/components/stats/trophies";
import { getConvexClient } from "~/app/providers/convex/env";
import { getSoccerSnapshot } from "~/app/providers/soccer-api";

const convexClient = getConvexClient("warn");

async function getTransfersSnapshot(): Promise<Doc<"transfers">[] | null> {
	if (!convexClient) return null;
	try {
		return await convexClient.query(api.football.getAllTransfers, {});
	} catch (err) {
		console.warn("getTransfersSnapshot failed", err);
		return null;
	}
}

async function getLatestEpisodeSnapshot(): Promise<Doc<"episodes"> | null> {
	if (!convexClient) return null;
	const cacheKey = "latest-episode-hakapit";
	try {
		const cached = await convexClient.query(api.cache.getCacheTracking, { dataType: cacheKey });
		if (cached?.expiresAt && cached.payload && cached.expiresAt > Date.now()) {
			return JSON.parse(cached.payload) as Doc<"episodes">;
		}
	} catch (err) {
		console.warn("latest episode cache read failed", err);
	}

	try {
		const latest = await convexClient.query(api.podcasts.getLatestEpisode, { podcastName: "hakapit" });
		if (latest) {
			await convexClient.mutation(api.cache.updateCacheTracking, {
				dataType: cacheKey,
				source: "podcast-feed",
				payload: JSON.stringify(latest),
				expiresAt: Date.now() + 5 * 60 * 1000,
			});
		}
		return latest;
	} catch (err) {
		console.warn("latest episode fetch failed", err);
		return null;
	}
}

export const Route = createFileRoute("/")({
	component: Home,
	loader: async () => {
		const snapshot = await getSoccerSnapshot();
		let transfers: Awaited<ReturnType<typeof getTransfersSnapshot>> | null = null;
		let latestEpisode: Doc<"episodes"> | null = null;
		try {
			transfers = await getTransfersSnapshot();
		} catch (err) {
			console.warn("Failed to fetch transfers snapshot", err);
		}
		try {
			latestEpisode = await getLatestEpisodeSnapshot();
		} catch (err) {
			console.warn("Failed to fetch latest episode snapshot", err);
		}
		return { snapshot, transfers, latestEpisode };
	},
	head: () => ({
		title: "הכפית",

		meta: [
			{
				name: "description",
				content: "דף הבית של משפחת הכפית",
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
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: "https://hakapit.online/" },
			{ property: "og:title", content: "הכפית" },
			{ property: "og:description", content: "דף הבית של משפחת הכפית" },
			{
				property: "og:image",
				content: "https://hakapit.online/icon-512x512.png",
			},
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: "הכפית" },
			{ name: "twitter:description", content: "דף הבית של משפחת הכפית" },
			{
				name: "twitter:image",
				content: "https://hakapit.online/icon-512x512.png",
			},
			{ name: "twitter:url", content: "https://hakapit.online/" },
			{ name: "twitter:site", content: "@hakapit" },
		],
	}),
});

const useSoccerSnapshot = (initialSnapshot: Awaited<ReturnType<typeof getSoccerSnapshot>>) => {
	return useQuery({
		queryKey: ["soccerSnapshot"],
		queryFn: () => getSoccerSnapshot(),
		staleTime: 10 * 60 * 1000,
		refetchOnWindowFocus: true,
		initialData: initialSnapshot,
		initialDataUpdatedAt: Date.now(),
	});
};

function StatSkeleton() {
	return (
		<div className="w-full flex justify-center">
			<div className="animate-pulse bg-slate-800/50 rounded-xl w-full max-w-[720px] h-48" />
		</div>
	);
}

function TransfersSkeleton() {
	const skeletonIds = ["a", "b", "c", "d", "e", "f"];
	return (
		<div className="flex flex-wrap justify-center gap-4 w-full px-4">
			{skeletonIds.map((id) => (
				<div key={id} className="animate-pulse bg-slate-800/50 rounded-xl h-24 w-24" />
			))}
		</div>
	);
}

function Home() {
	const { snapshot: initialSnapshot, transfers, latestEpisode } = Route.useLoaderData();

	const { data: soccerSnapshot, isLoading: snapshotLoading } = useSoccerSnapshot(initialSnapshot);
	const leaguesData = soccerSnapshot?.leaguesData ?? [];
	const nextMatchData = soccerSnapshot?.nextMatchData ?? undefined;

	return (
		<section className="lg:about lg:py-0 flex flex-col items-center justify-center h-full py-4 text-center">
			<div className="flex flex-col w-full gap-10">
				<Trophies />
				<div className="flex flex-wrap justify-center">
					<LatestEpisode initialEpisode={latestEpisode ?? undefined} />
				</div>
				<Suspense fallback={<TransfersSkeleton />}>
					<div className="flex flex-wrap justify-center w-full">
						<RecentTransfers initialTransfers={transfers ?? undefined} />
					</div>
				</Suspense>
				{snapshotLoading ? (
					<FullBleed>
						<div className="animate-pulse bg-slate-800/60 rounded-xl h-32 w-full max-w-[720px] mx-auto" />
					</FullBleed>
				) : (
					<NextMatchOverview nextMatchData={nextMatchData ?? undefined} />
				)}
				<Suspense fallback={<StatSkeleton />}>
					<StatsTable leaguesData={leaguesData ?? []} />
				</Suspense>
			</div>
			<FloatingChat />
		</section>
	);
}
