import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// installGlobals({ nativeFetch: true });
export default defineConfig({
	server: {
		port: 3000,
	},
	ssr: {
		noExternal: [/@nivo\/.+/, /d3-.+/, /fotmob/],
	},
	plugins: [
		// remixDevTools(),
		remix({
			ignoredRouteFiles: ["**/.*"],
			future: {
				unstable_singleFetch: true,
			},
		}),

		tsconfigPaths(),
	],
});
