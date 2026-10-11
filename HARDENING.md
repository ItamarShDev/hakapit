# Convex hardening and rollout

## Deploy order and compatibility

Deploy the Convex functions and schema before deploying the frontend to enable cursor pagination. New SSR responses carry `paginationVersion: 1`; only then does the frontend subscribe through `getEpisodesPage`. Older deployments omit that marker, so the frontend keeps using the existing bounded `getPodcastWithEpisodes` subscription and never calls an API that has not been deployed.

Transfer mutations (`upsertTransfer`, `deleteTransfer`, and `clearTransferPhoto`) are internal-only. Trusted administrators can use authenticated Convex CLI or dashboard tools with the internal function reference. Public transfer reads remain available to the site.

## Refresh leases and cache behavior

Football resource TTLs, RSS's five-minute TTL, the cron schedule, RSS ingestion, and snapshot merge behavior are unchanged. Soccer snapshot and RSS refreshes use atomic leases in `refreshLocks`, separate from cache entries. A lease lasts 120 seconds; failed owners leave a 30-second retry cooldown and do not update the cache. Completion and release require the current lease token, preventing an expired owner from overwriting data or releasing a successor's lease.

Cache payload freshness is parsed at action time. Soccer treats a future expiry as fresh only when its JSON payload parses to a non-null value; the atomic claim mutation repeats this check. RSS metadata does not require a payload. Stale soccer data remains available during refresh and failure.

## Episode pagination

`getPodcastWithEpisodes` is retained for SSR and old clients, defaults to ten rows, accepts safe integer limits from 1 to 1,000, and fetches one extra row to report `hasMore`. `getEpisodesPage` uses descending `by_podcastId_and_number` cursor pages of 1–100 items. New responses include only the podcast name on each episode, not the full parent document; they no longer calculate a full episode count. The latest-episode fallback uses descending `by_podcastId_and_publishedAt`.

## Remaining collection reads

Episode feeds and latest-episode reads use bounded indexed queries. The remaining `.collect()` calls are limited to the curated transfer table (public full/team reads), the small cache table during expiry cleanup, and explicit internal episode administration (clear-all, count, duplicate audit). The admin operations are not invoked by normal refreshes or tests; their dataset-wide scope is intentional and separate from hot feed queries.

## Dependencies and verification

The unused `next-themes` and direct router-plugin dependencies were removed; the three TanStack devtools packages are development-only. `convex-test` is pinned to `0.0.61` for offline function tests; existing `happy-dom@20.14.6` supports DOM regressions without adding Vitest.

From the repository root, with Bun 1.4.3 and Node 24.21.0:

```powershell
$env:NODE_ENV = "development"
bun test convex/hardening.test.ts
bun test src/features/podcast/feed-dom.test.tsx src/lib/html.test.ts src/server/chat-stream.test.ts
bun run typecheck
bun run lint
bun run check
bun test

$env:NODE_ENV = "production"
$env:CONVEX_URL = "https://good-elk-277.convex.cloud"
$env:VITE_CONVEX_URL = "https://good-elk-277.convex.cloud"
bun run build
```

The tests use the in-memory `convex-test` backend and local fixtures. They do not deploy Convex or contact football-data.
