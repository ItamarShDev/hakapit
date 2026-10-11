# hakapit.online

[![E2E Tests](https://github.com/ItamarShDev/hakapit/actions/workflows/e2e-tests.yml/badge.svg?branch=main)](https://github.com/ItamarShDev/hakapit/actions/workflows/e2e-tests.yml)

## Local development

Install the locked dependencies and start the Vite development server:

```powershell
$env:NODE_ENV = "development"
bun install --frozen-lockfile
bun run dev
```

## Comparison checks

Run the repository checks, typecheck, and test suite:

```powershell
$env:NODE_ENV = "development"
bun run check
bun run typecheck
bun test
```

Build and start the local production server with the existing public Convex backend:

```powershell
$env:NODE_ENV = "production"
$env:CONVEX_URL = "https://good-elk-277.convex.cloud"
$env:VITE_CONVEX_URL = "https://good-elk-277.convex.cloud"
bun run build
node .output/server/index.mjs
```

The build writes the server entry point to `.output/server/index.mjs` and static assets to `.output/public`. The endpoints use the existing backend and may refresh normal feed data.

## Optimized app behavior

- Chat replies stream incrementally over server-sent events. The server forwards cancellation to the provider, reports safe errors (including rate limits and incomplete streams), and does not automatically retry after sending output. Retry is an explicit user action.
- Podcast feeds retain their last resolved snapshot if a live Convex query errors. The feed exposes a retry action to resubscribe, keeps the snapshot visible during recovery, and distinguishes loading from empty feeds.
- Podcast images use responsive size hints and promote only the initial or viewport-visible feed cards to high priority. Feed and latest-episode playback controls expose descriptive labels, and HTML descriptions are sanitized at render time.

See [TESTING.md](./TESTING.md) for comparison revisions, commands, and pending browser/performance evidence. Benchmark and scoring work is maintained outside this repository.

See [HARDENING.md](./HARDENING.md) for Convex rollout order, cursor pagination, refresh leases, and offline verification.
