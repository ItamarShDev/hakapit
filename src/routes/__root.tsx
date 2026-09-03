import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRouteWithContext, HeadContent, Scripts, useParams } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import ConvexProvider from "../integrations/convex/provider";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";
import { MainLayout } from "~/layouts/main";
import { PlayerProvider } from "~/layouts/player/provider";
import { pageHead, SITE_TITLE, SITE_URL } from "~/lib/seo";

import type { QueryClient } from "@tanstack/react-query";
import type { PodcastName } from "~/features/podcast/podcasts";

interface RouterContext {
  queryClient: QueryClient;
}
function getThemeColor(podcast: string | undefined) {
  switch (podcast) {
    case "nitk":
      return "#3d0040";
    case "balcony-albums":
      return "#b54f52";
    default:
      return "#760d2a";
  }
}
export const Route = createRootRouteWithContext<RouterContext>()({
  head: ({ params }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "theme-color", content: getThemeColor((params as { podcast?: string }).podcast) },
      { name: "color-scheme", content: "dark light" },
      ...pageHead({
        title: SITE_TITLE,
        description: "אתר הבית של משפחת הכפית",
        image: `${SITE_URL}/logo.webp`,
        path: "",
        author: "משפחת הכפית",
      }).meta,
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },

      {
        rel: "icon",
        href: "/favicon.ico",
      },
      {
        rel: "icon",
        href: "/icon.svg",
        type: "image/svg+xml",
      },
      {
        rel: "icon",
        href: "/icon.png",
        type: "image/png",
        sizes: "any",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-icon.png",
        sizes: "180x180",
      },
      {
        rel: "manifest",
        href: "/manifest.webmanifest",
      },
      {
        rel: "mask-icon",
        href: "/icon.svg",
        color: "#000000",
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { podcast = "hakapit" } = useParams({ strict: false });

  return (
    <html lang="he">
      <head>
        <HeadContent />
      </head>
      <body className={podcast}>
        <ConvexProvider>
          <MainLayout params={{ podcast: podcast as PodcastName }}>
            <PlayerProvider>{children}</PlayerProvider>
          </MainLayout>
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        </ConvexProvider>
        {import.meta.env.PROD && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
        <Scripts />
      </body>
    </html>
  );
}
