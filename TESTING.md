# Testing with Playwright

This project uses Playwright for end-to-end testing with comprehensive coverage of the Hebrew RTL web application.

## Quick Start

```bash
# Install dependencies
bun install

# Install Playwright browsers
bun run test:e2e:install

# Run all tests
bun run test:e2e

# Run tests in UI mode (interactive)
bun run test:e2e:ui

# Run tests in headed mode (visible browser)
bun run test:e2e:headed

# Run tests on specific browser
bun run test:e2e:chrome
bun run test:e2e:firefox
bun run test:e2e:safari

# Run responsive tests
bun run test:e2e:responsive

# Run Hebrew RTL tests
bun run test:e2e:hebrew

# View test report
bun run test:e2e:report
```

## TanStack comparison checks

These focused checks cover independent homepage fallbacks, safe podcast HTML, the SSR chat launcher and mobile menu, and feed-image priority:

```powershell
bun test src/lib/home-snapshot.test.ts src/lib/html.test.ts src/features/chat/floating-chat.test.ts src/layouts/header/menu.test.ts src/features/podcast/feed.test.ts
bun run check
bun run typecheck
bun test
```

For a production build, set the same public Convex read endpoint for server and browser bundles:

```powershell
$env:NODE_ENV = "production"
$env:CONVEX_URL = "https://good-elk-277.convex.cloud"
$env:VITE_CONVEX_URL = "https://good-elk-277.convex.cloud"
bun run build
```

The comparison/scoring protocol and runtime measurements are maintained outside this repository; these commands do not produce or claim a score.

## Test Structure

- **`tests/page-objects/`** - Page Object Models for maintainable test code
- **`tests/mocks/`** - API mocking infrastructure for deterministic testing
- **`tests/homepage.spec.ts`** - Core homepage functionality tests
- **`tests/responsive.spec.ts`** - Mobile/tablet/desktop responsive design tests
- **`tests/hebrew-rtl.spec.ts`** - Hebrew language and RTL direction tests

## CI/CD

Tests automatically run on every GitHub commit across multiple browsers and devices. See `.github/workflows/e2e-tests.yml` for configuration.

## Current Status

✅ **36 core tests passing** - Critical user flows validated  
🔄 **32 tests skipped** - Optimization opportunities for future iteration

The foundation is production-ready with solid coverage of page loading, Hebrew text rendering, component visibility, and responsive design.
