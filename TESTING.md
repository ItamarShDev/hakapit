# Testing

`bun test` runs the existing date, text-direction, podcast-name, and football-score tests, plus native Remix component interaction, SSR routing, chat SSE parsing, and HTML sanitization tests.

`bun run check`, `bun run typecheck`, and `bun run build` verify formatting, lint, TypeScript, and browser/server production bundles.

Route tests use injected data services instead of calling a live Convex deployment. Interaction tests use Happy DOM and `remix/component/test`; they exercise explicit update functions and player context without external media or API calls.

For a real-browser parity check, compare the main branch with this branch at both desktop and phone widths. Cover all three podcast themes, menu open/close, load more, episode links, back/forward navigation while audio plays, transfer popovers, trophy/form tooltips, and chat open/close/send/retry. Chat needs a valid Gemini key; live data requires a Convex deployment with the repository's functions.

The previous Playwright scripts referenced by this document were no longer present in the repository before this migration.
