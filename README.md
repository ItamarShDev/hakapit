# hakapit.online — Remix 3

This branch reimplements the existing Hebrew podcast and Liverpool site using Remix 3.0.0's native component runtime, explicit `handle.update()` calls, mixins, streaming SSR, and server routes. It does not use React or TanStack Start. Convex and the existing themes, fonts, URL structure, and Gemini chat backend are retained.

## Development

Use Node.js **24.3 or newer** and Bun.

```sh
bun install
bun run dev
```

The app listens on port 3000 (override with `PORT`). Set `CONVEX_URL` or `VITE_CONVEX_URL` to a deployment containing this repository's Convex functions. The public Convex URL is passed from SSR to hydrated components; live subscriptions do not require a separate browser build-time variable. Set `GOOGLE_GENERATIVE_AI_API_KEY` for chat. Local `.env` files are loaded by the Node entrypoints and must not be committed.

## Verification and production

```sh
bun run check
bun run typecheck
bun test
bun run build
bun run start
```

The build produces browser assets under `dist/client` and the Node request handler under `dist/server`. Vercel serves static assets and routes remaining requests to the Node function in `api/index.ts`. Production Convex deployment stays in the existing Vercel build command; preview builds do not deploy Convex.

## Preserved routes

- `/`: latest episode, trophies, transfers, next match, standings, and Liver-Chat
- `/:podcast`: live episode feed and load-more pagination
- `/:podcast/episodes`: redirect to the feed
- `/:podcast/latest` and `/:podcast/episodes/:id`: episode detail
- `POST /api/chat`: existing Gemini + Google Search SSE protocol

Podcast names remain `hakapit`, `nitk`, and `balcony-albums`. Remix frame navigation keeps the player mounted between routes. A frame-based fallback preserves client navigation on browsers without the Navigation API.
