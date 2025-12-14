// vite.config.ts

import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		devtools(),
		tailwindcss(),
		// Enables Vite to resolve imports using path aliases.
		tsconfigPaths(),
		tanstackStart({
			srcDirectory: "src", // This is the default
			router: {
				// Specifies the directory TanStack Router uses for your routes.
			},
		}),
		viteReact({
			babel: {
				plugins: [["babel-plugin-react-compiler", {}]],
			},
		}),
	],
});
