import { type Handle } from "remix/component";

import { Application } from "~/app";
import { pageHead } from "~/lib/seo";
import { resolveConvexUrl } from "~/server/convex-client";

import type { PageData } from "~/page-data";
export function Document(handle: Handle<{ page: PageData; development: boolean; styles: string[] }>) {
  return () => {
    const { page, development, styles } = handle.props;
    const color = page.podcast === "nitk" ? "#3d0040" : page.podcast === "balcony-albums" ? "#b54f52" : "#760d2a";
    return (
      <html lang="he">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="theme-color" content={color} />
          <meta name="color-scheme" content="dark light" />
          <title>{page.title}</title>
          {pageHead(page)
            .meta.filter((meta) => !("title" in meta))
            .map((meta) => (
              <meta {...meta} />
            ))}
          {styles.map((href) => (
            <link rel="stylesheet" href={href} />
          ))}
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="icon" href="/icon.png" type="image/png" sizes="any" />
          <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
          <link rel="manifest" href="/manifest.webmanifest" />
          <link rel="mask-icon" href="/icon.svg" />
        </head>
        <body className={page.podcast}>
          <Application pageJson={JSON.stringify(page)} convexUrl={resolveConvexUrl("silent")} />
          {development && <script type="module" src="/@vite/client" />}
          <script type="module" src={development ? "/src/client.ts" : "/assets/client.js"} />
        </body>
      </html>
    );
  };
}
