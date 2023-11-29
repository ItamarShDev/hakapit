import { cn } from "@/lib/utils";
import {
  defer,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import {
  Await,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Suspense, useEffect } from "react";
import { fetchPage } from "~/api/fetch-page";
import { AnalyticsWrapper } from "~/components/analytics";
import { DancingIcon } from "~/components/dancing-icon";
import Header from "~/components/header";
import styles from "~/styles/tailwind.css";

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
}) => {
  return currentUrl !== nextUrl;
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Heebo&family=Amatic+SC&family=Rubik+80s+Fade&family=Rubik+Moonrocks&display=swap",
  },
];

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const metadata = fetchPage(params.podcast || "hakapit", 1);
  return defer({ metadata, podcast: params.podcast } as {
    limit: number;
    metadata: typeof metadata;
    podcast: "hakapit" | "balcony-albums" | "nitk";
  });
};

export function ScriptTwitter({ id }: { id: string }) {
  useEffect(() => {
    document.getElementById("twitter-wjs")?.remove();
    const scriptTag = document.createElement("script");
    scriptTag.id = "twitter-wjs";
    scriptTag.src = `https://platform.twitter.com/widgets.js?v=${id}`;
    document.body.appendChild(scriptTag);
  }, [id]);
  return null;
}

export default function App() {
  const { metadata, podcast } = useLoaderData<typeof loader>();
  const id =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  console.log(id);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ScriptTwitter id={id} />
        <Meta />
        <Links />
      </head>
      <body className={cn("body", podcast)}>
        <Suspense fallback={<DancingIcon />}>
          <Await resolve={metadata}>
            {(metadata) =>
              metadata && <Header data={metadata} podcast={podcast} />
            }
          </Await>
        </Suspense>
        <main className="main-content">
          <Suspense fallback={<DancingIcon />}>
            <Outlet />
          </Suspense>
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
