import { describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createApp } from "./app";

import type { Episode, PodcastWithEpisodes } from "~/features/podcast/types";
const episode: Episode = {
  episodeNumber: 42,
  guid: "sample-42",
  title: "פרק 42",
  description: "<![CDATA[<p>תיאור הפרק</p>]]>",
  htmlDescription: "<![CDATA[<p>תיאור הפרק</p>]]>",
  audioUrl: "https://example.com/episode.mp3",
  publishedAt: 1,
  podcast: { name: "hakapit" },
};
const feed: PodcastWithEpisodes = {
  title: "הכפית",
  description: "תיאור הפודקאסט",
  episodes: [episode],
  totalEpisodes: 30,
};
const app = createApp(true, {
  getSoccerSnapshot: async () => null,
  getTransfersSnapshot: async () => null,
  fetchUpdatedLatestEpisode: async () => episode,
  fetchUpdatedFeed: async () => feed,
  fetchEpisode: async (_podcast, number) => (number === 42 ? episode : null),
  chatResponse: async () => new Response("data: [DONE]\n\n", { headers: { "Content-Type": "text/event-stream" } }),
});
function request(path: string, init?: RequestInit) {
  return app(new Request("https://hakapit.test" + path, init));
}
describe("Remix route parity", () => {
  it("renders production HTML without depending on CDN files in the function directory", async () => {
    const previous = process.cwd();
    const directory = await mkdtemp(join(tmpdir(), "hakapit-function-"));
    try {
      process.chdir(directory);
      const server = createApp(false, {
        getSoccerSnapshot: async () => null,
        getTransfersSnapshot: async () => null,
        fetchUpdatedLatestEpisode: async () => episode,
        fetchUpdatedFeed: async () => feed,
        fetchEpisode: async () => episode,
        chatResponse: async () => new Response(),
      });
      const response = await server(new Request("https://hakapit.test/hakapit"));
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain("/assets/client.css");
      expect(html).toContain("/assets/client.js");
    } finally {
      process.chdir(previous);
      await rm(directory, { recursive: true });
    }
  });
  it("server-renders the Hebrew home, stylesheet and hydrated entry", async () => {
    const response = await request("/");
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(html).toContain('lang="he"');
    expect(html).toContain('class="hakapit"');
    expect(html).toContain('data-testid="trophies-section"');
    expect(html).toContain('data-testid="chat-trigger-button"');
    expect(html).toContain("/src/styles.css");
    expect(html).toContain("Application");
    expect(html).toContain("פרק 42");
  });
  for (const podcast of ["hakapit", "nitk", "balcony-albums"])
    it("renders the " + podcast + " theme and feed", async () => {
      const response = await request("/" + podcast);
      const html = await response.text();
      expect(response.status).toBe(200);
      expect(html).toContain('class="' + podcast + '"');
      expect(html).toContain("masonry");
      expect(html).toContain("/" + podcast + "/episodes/42");
      expect(html).toContain("הצג עוד");
      expect(html).toContain("<p>תיאור הפרק</p>");
    });
  it("renders latest and numbered episode detail routes", async () => {
    for (const path of ["/hakapit/latest", "/hakapit/episodes/42"]) {
      const response = await request(path);
      const html = await response.text();
      expect(response.status).toBe(200);
      expect(html).toContain("<p>תיאור הפרק</p>");
      expect(html).toContain("episode.mp3");
    }
  });
  it("redirects old episodes URLs and invalid podcasts", async () => {
    expect((await request("/hakapit/episodes")).headers.get("Location")).toBe("https://hakapit.test/hakapit");
    expect((await request("/not-a-podcast")).headers.get("Location")).toBe("https://hakapit.test/");
    expect((await request("/nitk/episodes/invalid")).headers.get("Location")).toBe("https://hakapit.test/");
  });
  it("returns an HTML 404 for missing episodes and paths", async () => {
    for (const path of ["/hakapit/episodes/9999", "/missing/path"]) {
      const response = await request(path);
      expect(response.status).toBe(404);
      expect(response.headers.get("Content-Type")).toContain("text/html");
      expect(await response.text()).toContain('lang="he"');
    }
  });
  it("keeps football JSON and chat SSE endpoints", async () => {
    expect(await (await request("/api/football")).json()).toBeNull();
    const response = await request("/api/chat", { method: "POST", body: "{}" });
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(await response.text()).toContain("[DONE]");
  });
  it("falls back to the shell when upstream data fails", async () => {
    const offline = createApp(true, {
      getSoccerSnapshot: async () => null,
      getTransfersSnapshot: async () => null,
      fetchUpdatedLatestEpisode: async () => null,
      fetchUpdatedFeed: async () => {
        throw new Error("offline");
      },
      fetchEpisode: async () => null,
      chatResponse: async () => new Response(),
    });
    const response = await offline(new Request("https://hakapit.test/hakapit"));
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("header");
  });
});
