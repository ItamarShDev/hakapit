import { cn } from "@/lib/utils";
import { type LinksFunction, type LoaderFunctionArgs } from "@remix-run/node";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { useEffect } from "react";
import { fetchPage } from "~/api/fetch-page";
import { AnalyticsWrapper } from "~/components/analytics";
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
    href: "https://fonts.googleapis.com/css2?family=Heebo&family=Amatic+SC&family=Rubik+80s+Fade&family=Rubik+Moonrocks&family=Karantina:wght@300&display=swap",
  },
];

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const metadata = await fetchPage(params.podcast || "hakapit", 1);
  return { metadata, podcast: params.podcast } as {
    metadata: typeof metadata;
    podcast: "hakapit" | "balcony-albums" | "nitk";
  };
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
        {metadata && <Header data={metadata} podcast={podcast} />}
        <main className="main-content">
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
