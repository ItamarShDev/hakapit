import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

import type { Plugin } from "vite";

export function bundleReport(): Plugin {
  return {
    name: "hakapit-bundle-report",
    apply: "build",
    writeBundle(_, bundle) {
      if (this.environment.name !== "client") return;
      const root = process.cwd().replaceAll("\\", "/");
      const relativeId = (id: string) => id.replaceAll("\\", "/").replaceAll(root, "<root>");
      const chunks = Object.values(bundle)
        .filter((item) => item.type === "chunk")
        .map((chunk) => ({
          file: chunk.fileName,
          entry: chunk.isEntry,
          bytes: Buffer.byteLength(chunk.code),
          gzipBytes: gzipSync(chunk.code, { level: 9 }).byteLength,
          imports: chunk.imports,
          dynamicImports: chunk.dynamicImports,
          modules: Object.entries(chunk.modules).map(([id, module]) => ({
            id: relativeId(id),
            renderedLength: module.renderedLength,
          })),
        }))
        .sort((a, b) => b.bytes - a.bytes);
      const directory = resolve(".bundle-stats");
      mkdirSync(directory, { recursive: true });
      writeFileSync(
        resolve(directory, "client.json"),
        JSON.stringify(
          {
            description:
              "Final chunk UTF-8 bytes and gzip level-9 estimates, not observed HTTP transfer. Module rendered lengths are bundler attribution estimates, not additive minified byte counts. Dynamic imports are not necessarily loaded on first navigation.",
            chunks,
          },
          null,
          2,
        ),
      );
    },
  };
}
