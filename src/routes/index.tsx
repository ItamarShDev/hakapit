import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { FloatingChat } from "~/app/components/chat/FloatingChat";
import { LatestEpisode } from "~/app/components/convex/LatestEpisode";
import { RecentTransfers } from "~/app/components/convex/RecentTransfers";
import { NextMatchOverview } from "~/app/components/next-match";
import { StatsTable } from "~/app/components/stats/stats";
import { Trophies } from "~/app/components/stats/trophies";
import { fetchUpdatedFeed } from "~/app/providers/rss/feed";
import {
  getLeague,
  getNextMatchData,
  getTeam,
} from "~/app/providers/soccer-api";
import type { League } from "~/app/providers/soccer-api/types/league";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async (opts) => {
    const team = await getTeam();
    if (!team?.runningCompetitions) {
      return { leaguesData: [] as Array<{ leagueId: string; league: League }> };
    }

    const leagueIds = Array.from(
      new Set(team.runningCompetitions.map((c) => c.code).filter(Boolean)),
    );
    const leagues = await Promise.all(
      leagueIds.map((leagueId) => getLeague({ data: leagueId })),
    );
    const pairs = leagues
      .map((league, index) => {
        const leagueId = leagueIds[index];
        if (!league || !leagueId) return null;
        return { leagueId, league };
      })
      .filter(Boolean) as Array<{ leagueId: string; league: League }>;
    const metadata = await fetchUpdatedFeed("hakapit", 1);
    const nextMatchData = await getNextMatchData();
    await opts.context.queryClient.prefetchQuery({
      ...convexQuery(api.football.getAllTransfers, {}),
    });
    return { leaguesData: pairs, nextMatchData, metadata };
  },
  head: () => ({
    title: "הכפית",

    meta: [
      {
        name: "description",
        content: "דף הבית של משפחת הכפית",
      },
      {
        property: "viewport",
        content: "width=device-width, initial-scale=1.0",
      },
      {
        property: "theme-color",
        content: "var(--color-primary)",
      },
      {
        property: "color-scheme",
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
    ],
  }),
});

function Home() {
  const { leaguesData, nextMatchData } = Route.useLoaderData();

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
        <NextMatchOverview nextMatchData={nextMatchData} />
        <StatsTable leaguesData={leaguesData} />
      </div>
      <FloatingChat />
    </section>
  );
}
