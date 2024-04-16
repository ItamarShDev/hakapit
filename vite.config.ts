import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { remixDevTools } from "remix-development-tools";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();
export default defineConfig({
	server: {
		port: 3000,
	},
	ssr: {
		noExternal: [/@nivo\/.+/, /d3-.+/, /fotmob/],
	},
	plugins: [
		remixDevTools(),
		remix({
			ignoredRouteFiles: ["**/.*"],
		}),

		tsconfigPaths(),
	],
});
