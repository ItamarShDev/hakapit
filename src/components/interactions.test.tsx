import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { Window, Document as DOMDocument } from "happy-dom";
import * as DOM from "happy-dom";
import { on, run, type Handle } from "remix/component";
import { renderToStream } from "remix/component/server";
import { render } from "remix/component/test";

import { Application } from "~/app";
import { PlayButton } from "~/features/podcast/play-button";
import Header from "~/layouts/header";
import { PlayerProvider } from "~/layouts/player/provider";
import { Popover, PopoverContent, PopoverTrigger } from "~/lib/ui/popover";
import { createNavigationResolver } from "~/navigation";

import type { FrameHandle } from "remix/component";
import type { Episode } from "~/features/podcast/types";
import type { PageData } from "~/page-data";
const window = new Window({ url: "https://hakapit.test/" });
beforeAll(() => {
  Object.assign(
    globalThis,
    Object.fromEntries(Object.entries(DOM).filter(([name]) => /^(HTML|SVG).*Element$/.test(name))),
  );
  Object.assign(globalThis, {
    window,
    document: window.document,
    HTMLElement: window.HTMLElement,
    Element: window.Element,
    Node: window.Node,
    Text: window.Text,
    Comment: window.Comment,
    Document: DOMDocument,
    DocumentFragment: window.DocumentFragment,
    SVGElement: window.SVGElement,
    HTMLTemplateElement: window.HTMLTemplateElement,
    HTMLScriptElement: window.HTMLScriptElement,
    NodeFilter: window.NodeFilter,
    DOMParser: window.DOMParser,
    MutationObserver: window.MutationObserver,
    HTMLStyleElement: window.HTMLStyleElement,
    HTMLLinkElement: window.HTMLLinkElement,
    HTMLHeadElement: window.HTMLHeadElement,
    HTMLBodyElement: window.HTMLBodyElement,
    HTMLAnchorElement: window.HTMLAnchorElement,
    ShadowRoot: window.ShadowRoot,
    Range: window.Range,
    HTMLAudioElement: window.HTMLAudioElement,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
    getComputedStyle: window.getComputedStyle.bind(window),
  });
});
let cleanup: (() => void) | undefined;
afterEach(() => {
  cleanup?.();
});
describe("native update-function interactions", () => {
  it("opens and closes the mobile navigation", async () => {
    const ui = render(<Header data={{ title: "הכפית", imageUrl: "" }} podcast="hakapit" />);
    cleanup = ui.cleanup;
    expect(ui.$(".header-links")?.className).toContain("hide-menu");
    await ui.act(() => ui.$(".menu-button")?.click());
    expect(ui.$(".header-links")?.className).toContain("show-menu");
    await ui.act(() => ui.$(".header-links a")?.click());
    expect(ui.$(".header-links")?.className).toContain("hide-menu");
  });
  it("updates a controlled transfer popover", async () => {
    function Transfer(handle: Handle) {
      let open = false;
      return () => (
        <Popover
          open={open}
          onOpenChange={(value) => {
            open = value;
            handle.update();
          }}
        >
          <PopoverTrigger>player</PopoverTrigger>
          <PopoverContent>transfer details</PopoverContent>
        </Popover>
      );
    }
    const ui = render(<Transfer />);
    cleanup = ui.cleanup;
    expect(ui.$('[role="dialog"]')).toBeNull();
    await ui.act(() => ui.$("button")?.click());
    expect(ui.$('[role="dialog"]')?.textContent).toBe("transfer details");
    await ui.act(() => ui.$("button")?.click());
    expect(ui.$('[role="dialog"]')).toBeNull();
  });
  it("shares play and pause state through native context", async () => {
    const episode: Episode = {
      guid: "fixture",
      title: "sample",
      episodeNumber: 1,
      audioUrl: "https://example.com/sample.mp3",
    };
    function Trigger(handle: Handle) {
      return () => (
        <button
          type="button"
          className="play"
          mix={on("click", () => handle.context.get(PlayerProvider).setCurrentlyPlaying(episode))}
        >
          <PlayButton episode={episode} />
        </button>
      );
    }
    const ui = render(
      <PlayerProvider>
        <Trigger />
      </PlayerProvider>,
    );
    cleanup = ui.cleanup;
    const audio = ui.$("audio") as unknown as HTMLAudioElement;
    audio.load = () => {};
    audio.play = async () => {
      audio.dispatchEvent(new window.Event("playing") as unknown as Event);
    };
    audio.pause = () => {
      audio.dispatchEvent(new window.Event("pause") as unknown as Event);
    };
    await ui.act(() => ui.$(".play")?.click());
    await ui.act(() => {});
    expect(audio.getAttribute("src")).toBe(episode.audioUrl);
    expect(ui.$(".play svg:last-child")?.getAttribute("class")).toContain("scale-100");
    await ui.act(() => ui.$(".play")?.click());
    await ui.act(() => {});
    expect(ui.$(".play svg:last-child")?.getAttribute("class")).toContain("scale-0");
    await ui.act(() => ui.$('[aria-label="סגור נגן"]')?.click());
    expect(audio.getAttribute("src")).toBeNull();
  });
});
it("keeps audio mounted while transitioning between hydrated frames", async () => {
  const episode: Episode = {
    guid: "sample-1",
    episodeNumber: 1,
    title: "sample",
    audioUrl: "https://example.com/sample.mp3",
  };
  const base = { path: "/hakapit", podcast: "hakapit" as const, title: "הכפית", description: "feed", image: "" };
  const page: PageData = { ...base, kind: "feed", feed: { episodes: [episode], totalEpisodes: 1 } };
  async function html(page: PageData) {
    return (
      "<!DOCTYPE html>" +
      (await new Response(
        renderToStream(
          <html>
            <head />
            <body>
              <Application pageJson={JSON.stringify(page)} convexUrl={null} />
            </body>
          </html>,
          {
            frameSrc: "https://hakapit.test/",
            resolveClientEntry: () => ({ href: "/entry.js", exportName: "Application" }),
          },
        ),
      ).text())
    );
  }
  document.open();
  document.write(await html(page));
  document.close();
  let nextHtml = "";
  let oldTheme = "";
  let newTheme = "";
  let transitionFinished: Promise<void> | undefined;
  const originalTransition = document.startViewTransition;
  document.startViewTransition = (update) => {
    oldTheme = document.body.className;
    const updateCallbackDone = Promise.resolve().then(async () => {
      if (typeof update === "function") await update();
      newTheme = document.body.className;
    });
    transitionFinished = updateCallbackDone;
    return {
      ready: Promise.resolve(),
      updateCallbackDone,
      finished: updateCallbackDone,
      types: new Set<string>(),
      skipTransition() {},
    };
  };
  const runtime = run({
    loadModule: () => Application,
    resolveFrame: createNavigationResolver(
      () => runtime.frames.top,
      () => new Response(nextHtml),
    ),
  });
  try {
    await runtime.ready();
    const audio = document.querySelector("audio")!;
    audio.load = () => {};
    audio.play = async () => {
      audio.dispatchEvent(new window.Event("playing") as unknown as Event);
    };
    audio.pause = () => {
      audio.dispatchEvent(new window.Event("pause") as unknown as Event);
    };
    (document.querySelector(".episode-card button") as HTMLButtonElement).click();
    runtime.flush();
    await Promise.resolve();
    runtime.flush();
    expect(audio.getAttribute("src")).toBe(episode.audioUrl);
    nextHtml = await html({
      ...base,
      path: "/nitk",
      podcast: "nitk",
      kind: "feed",
      feed: { episodes: [episode], totalEpisodes: 1 },
    });
    runtime.frames.top.src = "https://hakapit.test/nitk";
    await runtime.frames.top.reload();
    await runtime.ready();
    await transitionFinished;
    runtime.flush();
    expect(document.querySelector("audio") === audio).toBe(true);
    expect(document.querySelector("audio")?.getAttribute("src")).toBe(episode.audioUrl);
    expect(document.body.className).toBe("nitk");
    expect(oldTheme).toBe("hakapit");
    expect(newTheme).toBe("nitk");
  } finally {
    runtime.dispose();
    document.startViewTransition = originalTransition;
  }
});

function fakeFrame() {
  return Object.assign(new EventTarget(), { src: "https://hakapit.test/nitk" }) as FrameHandle;
}

describe("navigation transitions", () => {
  it("retains the response and renders even when snapshots are rejected", async () => {
    const frame = fakeFrame();
    const response = new Response("destination", { status: 404 });
    const original = document.startViewTransition;
    let finished: Promise<void> | undefined;
    document.startViewTransition = (update) => {
      const updateCallbackDone = Promise.resolve().then(async () => {
        if (typeof update === "function") await update();
      });
      finished = updateCallbackDone;
      return {
        ready: Promise.reject(new Error("duplicate transition names")),
        types: new Set<string>(),
        updateCallbackDone,
        finished: updateCallbackDone,
        skipTransition() {},
      };
    };
    try {
      const resolve = createNavigationResolver(
        () => frame,
        () => response,
      );
      expect(await resolve(frame.src)).toBe(response);
      expect(response.bodyUsed).toBe(false);
      frame.dispatchEvent(new Event("reloadComplete"));
      await finished;
    } finally {
      document.startViewTransition = original;
    }
  });
  it("does not hang if navigation aborts before the snapshot callback runs", async () => {
    const frame = fakeFrame();
    const response = new Response("cancelled destination");
    const controller = new AbortController();
    const original = document.startViewTransition;
    const started = Promise.withResolvers<void>();
    const finished = Promise.withResolvers<void>();
    let skipped = false;
    let callback: (() => Promise<void> | void) | undefined;
    document.startViewTransition = (update) => {
      if (typeof update === "function") callback = update;
      started.resolve();
      return {
        ready: Promise.resolve(),
        types: new Set<string>(),
        updateCallbackDone: finished.promise,
        finished: finished.promise,
        skipTransition() {
          skipped = true;
        },
      };
    };
    try {
      const resolve = createNavigationResolver(
        () => frame,
        () => response,
      );
      const pending = resolve(frame.src, { signal: controller.signal });
      await started.promise;
      controller.abort();
      expect(await pending).toBe(response);
      await callback?.();
      expect(skipped).toBe(true);
      finished.resolve();
    } finally {
      document.startViewTransition = original;
    }
  });
  it("respects reduced motion without buffering or animating the response", async () => {
    const frame = fakeFrame();
    const response = new Response("destination");
    const original = window.matchMedia;
    const originalTransition = document.startViewTransition;
    window.matchMedia = (query) => {
      const result = original.call(window, query);
      Object.defineProperty(result, "matches", { value: true });
      return result;
    };
    document.startViewTransition = () => {
      throw new Error("should not animate");
    };
    try {
      const resolve = createNavigationResolver(
        () => frame,
        () => response,
      );
      expect(await resolve(frame.src)).toBe(response);
      expect(response.bodyUsed).toBe(false);
    } finally {
      window.matchMedia = original;
      document.startViewTransition = originalTransition;
    }
  });
  it("preserves native request headers, form encoding, and error handling", async () => {
    const frame = fakeFrame();
    const originalFetch = globalThis.fetch;
    const requests: RequestInit[] = [];
    const formData = new FormData();
    formData.set("title", "hello world");
    let status = 200;
    globalThis.fetch = (async (_url, init) => {
      requests.push(init!);
      return new Response("content", { status, headers: { "Content-Type": "text/html" } });
    }) as typeof fetch;
    try {
      const resolve = createNavigationResolver(() => frame);
      await resolve(frame.src, {
        target: "form",
        method: "POST",
        formData,
        encType: "application/x-www-form-urlencoded",
      });
      expect((requests[0].headers as Headers).get("X-Remix-Frame")).toBe("true");
      expect((requests[0].headers as Headers).get("X-Remix-Target")).toBe("form");
      expect(requests[0].mode).toBe("same-origin");
      expect(requests[0].body?.toString()).toBe("title=hello+world");
      status = 500;
      await expect(resolve(frame.src)).rejects.toThrow("Failed to resolve frame: 500");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
