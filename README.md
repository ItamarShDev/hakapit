# hakapit.online

[![E2E Tests](https://github.com/ItamarShDev/hakapit/actions/workflows/e2e-tests.yml/badge.svg?branch=main)](https://github.com/ItamarShDev/hakapit/actions/workflows/e2e-tests.yml)

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run
```

This project was created using `bun init` in bun v1.2.18. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## TanStack comparison checks

Install the exact locked dependencies and run the checks:

```powershell
$env:NODE_ENV = "development"
bun install --frozen-lockfile
bun run check
bun run typecheck
bun test
```

Build the local production server with the public read-only Convex endpoint:

```powershell
$env:NODE_ENV = "production"
$env:CONVEX_URL = "https://good-elk-277.convex.cloud"
$env:VITE_CONVEX_URL = "https://good-elk-277.convex.cloud"
bun run build
```

The comparison/scoring protocol and runtime measurements are maintained outside this repository.
