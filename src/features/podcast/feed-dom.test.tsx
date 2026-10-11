import { Image } from "@unpic/react";
import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";

import { LatestEpisodePlaybackControl } from "./episode-card";
import { MasonryFeed } from "./feed";
import { DETAIL_IMAGE_SIZES } from "./image-layout";
import { PlayerProvider } from "~/layouts/player/provider";

import type { FeedData } from "./feed";
import type { Episode } from "./types";

const episode: Episode = {
  episodeNumber: 1,
  guid: "episode-1",
  title: "Episode one",
  imageUrl: "https://example.com/episode.jpg",
  audioUrl: "https://example.com/episode.mp3",
};

const snapshot: NonNullable<FeedData> = {
  episodes: [episode],
  totalEpisodes: 1,
  description: "A feed",
};

class TestIntersectionObserver {
  static instances: TestIntersectionObserver[] = [];
  targets: Element[] = [];

  constructor(private readonly callback: IntersectionObserverCallback) {
    TestIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.targets.push(target);
  }

  disconnect() {
    this.targets = [];
  }

  intersect(target: Element) {
    this.callback(
      [{ target, isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

function TestCard({
  episode: cardEpisode,
  imageKey,
  imageSizes,
  priority,
}: {
  episode: Episode;
  imageKey: string;
  imageSizes: string;
  priority: boolean;
}) {
  return (
    <article data-image-key={imageKey}>
      <img
        src={cardEpisode.imageUrl ?? undefined}
        sizes={imageSizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        alt=""
      />
      <span>{cardEpisode.title}</span>
    </article>
  );
}

function installDom() {
  const happyWindow = new Window();
  const previous = new Map<string, unknown>();
  for (const key of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "Node",
    "ResizeObserver",
    "IntersectionObserver",
    "IS_REACT_ACT_ENVIRONMENT",
  ]) {
    previous.set(key, (globalThis as Record<string, unknown>)[key]);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value:
        key === "IS_REACT_ACT_ENVIRONMENT"
          ? true
          : key === "IntersectionObserver"
            ? TestIntersectionObserver
            : (happyWindow as unknown as Record<string, unknown>)[key],
    });
  }
  return () => {
    happyWindow.close();
    for (const [key, value] of previous) {
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
  };
}

test("renders an accessible empty feed without a load-more control", async () => {
  const restore = installDom();
  function EmptyBridge({ onData }: { onData: (data: FeedData) => void }) {
    useEffect(() => onData(null), [onData]);
    return null;
  }

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => {
      root.render(<MasonryFeed data={null} podcast="hakapit" liveBridge={EmptyBridge} feedCard={TestCard} />);
    });
    expect(container.querySelector('[role="status"]')?.textContent).toContain("אין פרקים");
    expect(container.querySelector("button")).toBeNull();
  } finally {
    await act(async () => root.unmount());
    restore();
  }
});

test("shows server-known empty data while the live feed is pending", async () => {
  const restore = installDom();
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => {
      root.render(<MasonryFeed data={null} podcast="hakapit" liveBridge={() => null} feedCard={TestCard} />);
    });
    expect(container.querySelector('[role="status"]')?.getAttribute("data-feed-state")).toBe("empty");
    expect(container.querySelector("button")).toBeNull();
  } finally {
    await act(async () => root.unmount());
    restore();
  }
});

test("an empty feed with a known zero total has no load-more control", async () => {
  const restore = installDom();
  function EmptyBridge({ onData }: { onData: (data: FeedData) => void }) {
    useEffect(() => onData({ episodes: [], totalEpisodes: 0, description: "Empty" }), [onData]);
    return null;
  }

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => {
      root.render(<MasonryFeed data={null} podcast="hakapit" liveBridge={EmptyBridge} feedCard={TestCard} />);
    });
    expect(container.querySelector('[role="status"]')?.textContent).toContain("אין פרקים");
    expect(container.querySelector("button")).toBeNull();
  } finally {
    await act(async () => root.unmount());
    restore();
  }
});

test("retains the latest feed and disables pagination after a live error", async () => {
  const restore = installDom();
  const previousError = console.error;
  const previousWarn = console.warn;
  console.error = () => {};
  console.warn = () => {};
  let mode: "error" | "data" = "data";
  let subscriptionCount = 0;
  const liveData = {
    ...snapshot,
    episodes: snapshot.episodes.map((episode) => ({ ...episode, title: "Latest live episode" })),
    totalEpisodes: 10,
  };
  function TestBridge({ onData }: { onData: (data: FeedData) => void }) {
    useEffect(() => {
      subscriptionCount += 1;
      if (mode === "data") onData(liveData);
    }, [onData]);
    if (mode === "error") throw new Error("live failure");
    return null;
  }

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => {
      root.render(<MasonryFeed data={snapshot} podcast="hakapit" liveBridge={TestBridge} feedCard={TestCard} />);
    });
    expect(subscriptionCount).toBe(1);
    expect(container.textContent).toContain("Latest live episode");

    mode = "error";
    await act(async () => {
      root.render(<MasonryFeed data={snapshot} podcast="hakapit" liveBridge={TestBridge} feedCard={TestCard} />);
    });
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(container.textContent).toContain("Latest live episode");
    expect(container.textContent).not.toContain("Episode one");
    expect((container.querySelector(".mt-6 button") as HTMLButtonElement).disabled).toBe(true);

    mode = "data";
    const retry = container.querySelector('[role="alert"] button') as HTMLButtonElement;
    await act(async () => {
      retry.click();
    });

    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(subscriptionCount).toBe(2);
    expect(container.textContent).toContain("Latest live episode");
    expect(container.querySelector(".masonry")?.getAttribute("aria-busy")).toBe("false");
    expect((container.querySelector(".mt-6 button") as HTMLButtonElement).disabled).toBe(false);
  } finally {
    await act(async () => root.unmount());
    console.error = previousError;
    console.warn = previousWarn;
    restore();
  }
});

test("a resolved deletion remains empty after a live error and Retry", async () => {
  const restore = installDom();
  const previousError = console.error;
  const previousWarn = console.warn;
  console.error = () => {};
  console.warn = () => {};
  let mode: "error" | "deleted" = "deleted";
  function TestBridge({ onData }: { onData: (data: FeedData) => void }) {
    useEffect(() => {
      if (mode === "deleted") onData(null);
    }, [onData]);
    if (mode === "error") throw new Error("live failure after deletion");
    return null;
  }

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const renderFeed = () =>
    root.render(<MasonryFeed data={snapshot} podcast="hakapit" liveBridge={TestBridge} feedCard={TestCard} />);
  try {
    await act(async () => renderFeed());
    expect(container.textContent).not.toContain("Episode one");

    mode = "error";
    await act(async () => renderFeed());
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(container.textContent).not.toContain("Episode one");

    mode = "deleted";
    const retry = container.querySelector('[role="alert"] button') as HTMLButtonElement;
    await act(async () => retry.click());
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.textContent).not.toContain("Episode one");
    expect(container.querySelector("button")).toBeNull();
  } finally {
    await act(async () => root.unmount());
    console.error = previousError;
    console.warn = previousWarn;
    restore();
  }
});

test("promotes a viewport-visible feed card after hydration", async () => {
  const restore = installDom();
  TestIntersectionObserver.instances = [];
  const feed: NonNullable<FeedData> = {
    ...snapshot,
    totalEpisodes: 3,
    episodes: [
      episode,
      { ...episode, guid: "episode-2", episodeNumber: 2 },
      { ...episode, guid: "episode-3", episodeNumber: 3 },
    ],
  };

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => {
      root.render(<MasonryFeed data={feed} podcast="hakapit" liveBridge={() => null} feedCard={TestCard} />);
    });
    const secondCard = container.querySelector('[data-image-key="episode-2"]') as HTMLElement;
    const secondImage = secondCard.querySelector("img") as HTMLImageElement;
    expect(secondImage.getAttribute("loading")).toBe("lazy");

    await act(async () => {
      TestIntersectionObserver.instances.at(-1)?.intersect(secondCard);
    });
    expect(secondImage.getAttribute("loading")).toBe("eager");
    expect(secondImage.getAttribute("fetchpriority")).toBe("high");
  } finally {
    await act(async () => root.unmount());
    restore();
  }
});

test("disables load more while the next limit is loading", async () => {
  const restore = installDom();
  function TestBridge({ limit, onData }: { limit: number; onData: (data: FeedData) => void }) {
    useEffect(() => {
      if (limit === 10) onData({ ...snapshot, totalEpisodes: 2 });
    }, [limit, onData]);
    return null;
  }

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => {
      root.render(
        <MasonryFeed
          data={{ ...snapshot, totalEpisodes: 2 }}
          podcast="hakapit"
          liveBridge={TestBridge}
          feedCard={TestCard}
        />,
      );
    });
    const loadMore = container.querySelector("button") as HTMLButtonElement;
    await act(async () => loadMore.click());
    expect(loadMore.disabled).toBe(true);
    expect(container.querySelector('[data-feed-state="loading-more"]')).not.toBeNull();
  } finally {
    await act(async () => root.unmount());
    restore();
  }
});

test("renders responsive image preloads and an accessible latest playback action", () => {
  const feed = {
    ...snapshot,
    episodes: [
      episode,
      { ...episode, guid: "episode-2", episodeNumber: 2 },
      { ...episode, guid: "episode-3", episodeNumber: 3 },
    ],
  };
  const feedMarkup = renderToStaticMarkup(
    <MasonryFeed data={feed} podcast="hakapit" liveBridge={() => null} feedCard={TestCard} />,
  );
  const latestMarkup = renderToStaticMarkup(
    <PlayerProvider>
      <LatestEpisodePlaybackControl episode={episode} />
    </PlayerProvider>,
  );

  expect((feedMarkup.match(/rel="preload"/g) ?? []).length).toBe(1);
  expect([...feedMarkup.matchAll(/loading="(eager|lazy)"/g)].map((match) => match[1])).toEqual([
    "eager",
    "lazy",
    "lazy",
  ]);
  expect(feedMarkup).toContain("(min-width: 996px) min(576px, calc((100vw - 96px) / 3))");
  expect(feedMarkup).toContain("(min-width: 1024px) min(576px, calc((100vw - 96px) / 2))");
  expect(feedMarkup).toContain('loading="eager"');
  expect(feedMarkup).toContain('loading="lazy"');
  expect(feedMarkup).toContain('sizes="(min-width: 2024px) min(576px, calc((100vw - 224px) / 6))');
  expect(feedMarkup).toContain('sizes="auto, (min-width: 2024px)');
  expect(feedMarkup).toContain("(min-width: 1692px)");
  expect(latestMarkup).toContain('aria-label="הפעל פרק: Episode one"');
  expect(latestMarkup).toContain('sizes="(min-width: 1024px) 80px, (min-width: 768px) 56px, 40px"');
  expect(latestMarkup).toContain('aria-hidden="true"');
});

test("SSR preload URLs from the image renderer match its rendered image source", () => {
  const imageMarkup = renderToStaticMarkup(
    <Image src={episode.imageUrl!} sizes={DETAIL_IMAGE_SIZES} layout="fullWidth" fetchPriority="high" alt="" />,
  );

  const preloadUrl = imageMarkup.match(/<link[^>]*href="([^"]+)"/)?.[1];
  const imageUrl = imageMarkup.match(/<img[^>]*src="([^"]+)"/)?.[1];
  expect(preloadUrl).toBe(imageUrl);
  expect(imageMarkup).toContain(`sizes="${DETAIL_IMAGE_SIZES}"`);
});
