import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRouteWithContext, HeadContent, Scripts, useParams } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import ConvexProvider from "../integrations/convex/provider";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";
import { MainLayout } from "~/app/layouts/main";
import { PlayerProvider } from "~/app/layouts/Player/provider";

import type { QueryClient } from "@tanstack/react-query";
import type { PodcastName } from "~/app/providers/rss/feed";

interface MyRouterContext {
  queryClient: QueryClient;
}
function getColorByParam(param: PodcastName) {
  console.log("getColorByParam", param);
  switch (param) {
    case "nitk":
      return "#3d0040";
    case "balcony-albums":
      return "#b54f52";
    default:
      return "#760d2a";
  }
}
export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: ({ params }) => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      },
      {
        name: "theme-color",
        content: getColorByParam((params as any).podcast as PodcastName),
      },
      {
        name: "color-scheme",
        content: "dark light",
      },
      { title: "הכפית" },
      {
        name: "description",
        content: "אתר הבית של משפחת הכפית",
      },
      {
        name: "author",
        content: "משפחת הכפית",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: "https://hakapit.online",
      },
      {
        property: "og:title",
        content: "הכפית",
      },
      {
        property: "og:description",
        content: "אתר הבית של משפחת הכפית",
      },
      {
        property: "og:image",
        content: "https://hakapit.online/logo.webp",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "הכפית",
      },
      {
        name: "twitter:description",
        content: "אתר הבית של משפחת הכפית",
      },
      {
        name: "twitter:image",
        content: "https://hakapit.online/logo.webp",
      },
      {
        name: "twitter:url",
        content: "https://hakapit.online",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },

      // Favicons and app icons
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
      // Optional Safari pinned tab icon
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
