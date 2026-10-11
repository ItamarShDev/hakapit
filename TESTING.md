# Testing and comparison builds

This TanStack lab uses Bun's test runner. It does not include browser automation.

## Runtime requirements

- Node.js 24.3 or newer (CI and local comparison builds use 24.21.0)
- Bun 1.4.3

## Revisions

- Baseline: `202cc44f0a89942f99295bc19e6f4b9371ab7458`
- Optimized implementation: `2fcb83727d2e7d3d7b9bbca6a21418b770e5f639`

The baseline is an untouched worktree. Install each revision from its own
frozen lockfile and use the same Node, Bun, and public existing Convex backend
for comparison builds.

## Install and verify

Run these commands from the root of either checkout:

```powershell
$env:NODE_ENV = "development"
bun install --frozen-lockfile
bun run check
bun run typecheck
bun test
```

`bun run check` runs Oxfmt and Oxlint. Its formatter currently reports
pre-existing repository-wide issues in the untouched baseline; this work
formats changed files only. `bun run lint` runs Oxlint separately.
Focused coverage for the comparison changes:

```powershell
bun test src/lib/home-snapshot.test.ts src/lib/html.test.ts src/features/chat/floating-chat.test.ts src/layouts/header/menu.test.ts src/features/podcast/feed.test.ts
```

## Build and start the production server

Use the same public existing Convex backend URL for the server and browser
bundles:

```powershell
$env:NODE_ENV = "production"
$env:CONVEX_URL = "https://good-elk-277.convex.cloud"
$env:VITE_CONVEX_URL = "https://good-elk-277.convex.cloud"
bun run build
node .output/server/index.mjs
```

The build emits static assets to `.output/public` and the Node server entry to
`.output/server/index.mjs`. Run the start command from the same checkout root.

## Optimization rationale

- The SSR-visible chat launcher loads the heavier chat UI only on interaction
  intent, keeping its Markdown and chat dependencies out of the initial client
  entry.
- Podcast and transfer reads cross validated server-function boundaries; the
  homepage requests remain concurrent with independent fallbacks, and live
  Convex subscriptions remain client-side.
- Font subsets and image priorities are narrowed to the rendered surfaces;
  podcast HTML is sanitized at its render sinks, and player/chat placement and
  controls account for mobile layout and accessibility.

Browser and visual verification, as well as performance evidence, are pending.
This repository contains no benchmark harness or scoring claims.
