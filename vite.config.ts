import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
export default defineConfig(({ isSsrBuild }) => ({
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss()],
  oxc: { jsx: { runtime: "automatic", importSource: "remix/component" } },
  build: {
    outDir: "dist/client",
    rolldownOptions: {
      input: "src/client.ts",
      preserveEntrySignatures: "strict",
      output: { entryFileNames: isSsrBuild ? "app.js" : "assets/client.js", assetFileNames: "assets/[name][extname]" },
    },
  },
}));
