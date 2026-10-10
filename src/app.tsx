import { clientEntry, type Handle } from "remix/component";

import { FloatingChat } from "~/features/chat/floating-chat";
import { NextMatchOverview } from "~/features/football/next-match";
import { RecentTransfers } from "~/features/football/recent-transfers";
import { StatsTable } from "~/features/football/stats/stats";
import { Trophies } from "~/features/football/stats/trophies";
import Episode from "~/features/podcast/episode";
import { FeedPage } from "~/features/podcast/feed";
import { LatestEpisode } from "~/features/podcast/latest-episode";
import { ConvexProvider } from "~/integrations/convex/provider";
import { MainLayout } from "~/layouts/main";
import { PlayerProvider } from "~/layouts/player/provider";

import type { PageData } from "~/page-data";
function Home(handle: Handle<{ page: Extract<PageData, { kind: "home" }> }>) {
  let snapshot = handle.props.page.snapshot;
  let serverSnapshot = snapshot;
  let fetchedAt = Date.now();
  async function refresh() {
    if (Date.now() - fetchedAt < 10 * 60 * 1000) return;
    try {
      const response = await fetch("/api/football", { signal: handle.signal });
      if (response.ok) {
        snapshot = await response.json();
        fetchedAt = Date.now();
        await handle.update();
      }
    } catch (error) {
      if (!handle.signal.aborted) console.warn("Football refresh failed", error);
    }
  }
  handle.queueTask(() => {
    window.addEventListener("focus", refresh, { signal: handle.signal });
  });
  return () => {
    const { transfers, latestEpisode } = handle.props.page;
    if (serverSnapshot !== handle.props.page.snapshot) {
      serverSnapshot = handle.props.page.snapshot;
      snapshot = serverSnapshot;
      fetchedAt = Date.now();
    }
    return (
      <section className="lg:about lg:py-0 flex flex-col items-center justify-center h-full py-4 text-center">
        <div className="flex flex-col w-full gap-10">
          <Trophies />
          <div className="flex flex-wrap justify-center">
            <LatestEpisode podcast="hakapit" initialEpisode={latestEpisode} />
          </div>
          <div className="flex flex-wrap justify-center w-full">
            <RecentTransfers initialTransfers={transfers ?? undefined} />
          </div>
          <NextMatchOverview nextMatchData={snapshot?.nextMatchData ?? undefined} />
          <StatsTable leaguesData={snapshot?.leaguesData ?? []} />
        </div>
        <FloatingChat />
      </section>
    );
  };
}
export const Application = clientEntry(
  "application",
  function Application(handle: Handle<{ pageJson: string; convexUrl: string | null }>) {
    return () => {
      const page: PageData = JSON.parse(handle.props.pageJson);
      handle.queueTask(() => {
        document.body.className = page.podcast;
      });
      return (
        <ConvexProvider url={handle.props.convexUrl}>
          <MainLayout params={{ podcast: page.podcast }}>
            <PlayerProvider>
              {page.kind === "home" ? (
                <Home page={page} />
              ) : page.kind === "feed" ? (
                <FeedPage key={page.podcast} data={page.feed} podcast={page.podcast} />
              ) : page.kind === "episode" ? (
                <Episode data={page.episode} />
              ) : (
                <section className="p-10 text-center text-paragraph">
                  <h1>{page.message}</h1>
                  <a href="/">חזרה לבית</a>
                </section>
              )}
            </PlayerProvider>
          </MainLayout>
        </ConvexProvider>
      );
    };
  },
);
