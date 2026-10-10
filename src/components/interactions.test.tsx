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
it("hydrates native entries and keeps audio mounted across frame navigation", async () => {
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
  const runtime = run({ loadModule: () => Application, resolveFrame: () => nextHtml });
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
    runtime.flush();
    expect(document.querySelector("audio") === audio).toBe(true);
    expect(document.querySelector("audio")?.getAttribute("src")).toBe(episode.audioUrl);
    expect(document.body.className).toBe("nitk");
  } finally {
    runtime.dispose();
  }
});
