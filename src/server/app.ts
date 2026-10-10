import { api } from "convex/_generated/api";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "remix/component";
import { renderToStream } from "remix/component/server";
import { createRequestListener } from "remix/node-fetch-server";
import { createRouter } from "remix/router";

import { isPodcastName, PODCASTS } from "~/features/podcast/podcasts";
import { SITE_TITLE, SITE_URL } from "~/lib/seo";
import { chatResponse } from "~/server/chat";
import { getConvexClient } from "~/server/convex-client";
import { Document } from "~/server/document";
import { fetchEpisode, fetchUpdatedFeed, fetchUpdatedLatestEpisode } from "~/server/podcasts";
import { getSoccerSnapshot } from "~/server/soccer-api";

import type { PageData } from "~/page-data";
const convex = getConvexClient("warn");
async function optional<T>(load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch (error) {
    console.warn("Page data unavailable", error);
    return null;
  }
}
const services = {
  getSoccerSnapshot,
  getTransfersSnapshot: async () => (convex ? await convex.query(api.transfers.getAllTransfers, {}) : null),
  fetchUpdatedLatestEpisode,
  fetchUpdatedFeed,
  fetchEpisode,
  chatResponse,
};
export function createApp(development = false, data: typeof services = services) {
  const router = createRouter();
  async function pageResponse(request: Request, page: PageData, status = 200) {
    const styles = [development ? "/src/styles.css" : "/assets/client.css"];
    return new Response(
      renderToStream(createElement(Document, { page, development, styles }), {
        signal: request.signal,
        frameSrc: request.url,
        resolveClientEntry: () => ({
          href: development ? "/src/client.ts" : "/assets/client.js",
          exportName: "Application",
        }),
        onError: console.error,
      }),
      { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
  const metadata = {
    podcast: "hakapit" as const,
    title: SITE_TITLE,
    description: "דף הבית של משפחת הכפית",
    image: SITE_URL + "/icon-512x512.png",
  };
  router.get("/", async ({ request }) => {
    const [snapshot, transfers, latestEpisode] = await Promise.all([
      optional(data.getSoccerSnapshot),
      optional(data.getTransfersSnapshot),
      optional(() => data.fetchUpdatedLatestEpisode("hakapit")),
    ]);
    return pageResponse(request, { ...metadata, path: "/", kind: "home", snapshot, transfers, latestEpisode });
  });
  router.get("/api/football", async () => Response.json(await data.getSoccerSnapshot()));
  router.post("/api/chat", async ({ request }) => {
    try {
      return await data.chatResponse(request);
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Invalid chat request" }, { status: 400 });
    }
  });
  async function podcastPage(request: Request, podcast: string, episodeId?: string) {
    if (!isPodcastName(podcast)) return Response.redirect(new URL("/", request.url), 302);
    const path = new URL(request.url).pathname;
    if (episodeId !== undefined) {
      const number = Number(episodeId);
      if (episodeId !== "latest" && (!Number.isSafeInteger(number) || number < 0))
        return Response.redirect(new URL("/", request.url), 302);
      const episode =
        episodeId === "latest"
          ? await optional(() => data.fetchUpdatedLatestEpisode(podcast))
          : await optional(() => data.fetchEpisode(podcast, number));
      return pageResponse(
        request,
        {
          kind: "episode",
          podcast,
          path,
          episode,
          title: episode?.title ?? PODCASTS[podcast].title,
          description: episode?.description ?? "",
          image: episode?.imageUrl ?? PODCASTS[podcast].imageUrl,
        },
        episode ? 200 : 404,
      );
    }
    const feed = await optional(() => data.fetchUpdatedFeed(podcast, 10));
    return pageResponse(request, {
      kind: "feed",
      podcast,
      path,
      feed,
      title: feed?.title ?? PODCASTS[podcast].title,
      description: feed?.description ?? "",
      image: feed?.imageUrl ?? PODCASTS[podcast].imageUrl,
    });
  }
  router.get("/:podcast", ({ request, params }) => podcastPage(request, params.podcast));
  router.get("/:podcast/latest", ({ request, params }) => podcastPage(request, params.podcast, "latest"));
  router.get("/:podcast/episodes", ({ request, params }) =>
    Response.redirect(new URL(isPodcastName(params.podcast) ? "/" + params.podcast : "/", request.url), 302),
  );
  router.get("/:podcast/episodes/:id", ({ request, params }) => podcastPage(request, params.podcast, params.id));
  const mime: Record<string, string> = {
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".webmanifest": "application/manifest+json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".txt": "text/plain",
  };
  return async (request: Request): Promise<Response> => {
    const pathname = new URL(request.url).pathname;
    if (request.method === "GET" || request.method === "HEAD") {
      const base = resolve(development ? "public" : "dist/client");
      let candidate: string;
      try {
        candidate = resolve(base, "." + decodeURIComponent(pathname));
      } catch {
        return new Response("Bad Request", { status: 400 });
      }
      if (candidate.startsWith(base + sep)) {
        try {
          const info = await stat(candidate);
          if (info.isFile()) {
            const ext = candidate.slice(candidate.lastIndexOf("."));
            return new Response(request.method === "HEAD" ? null : await readFile(candidate), {
              headers: {
                "Content-Type": mime[ext] ?? "application/octet-stream",
                "Cache-Control": pathname.startsWith("/assets/") ? "public, max-age=3600" : "public, max-age=300",
              },
            });
          }
        } catch {}
      }
    }
    try {
      const response = await router.fetch(request);
      if (response.status === 404 && !(response.headers.get("Content-Type") ?? "").includes("text/html"))
        return pageResponse(request, { ...metadata, path: pathname, kind: "error", message: "העמוד לא נמצא" }, 404);
      return response;
    } catch (error) {
      console.error(error);
      return pageResponse(
        request,
        { ...metadata, path: pathname, kind: "error", message: "אירעה שגיאה. נסו שוב." },
        500,
      );
    }
  };
}
export const app = createApp();
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3000);
  createServer(createRequestListener(app)).listen(port, () =>
    console.log(`Remix 3 listening on http://localhost:${port}`),
  );
}
