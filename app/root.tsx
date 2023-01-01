import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { fetchEpisode, fetchPage } from "~/api/fetch-page";
import type { EpisodeData } from "~/api/types";
import Header from "~/components/header";
import { scrollHandler } from "~/hooks";
import twStyles from "./tailwind.css";
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: twStyles },
];

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  if (params?.episode) {
    const episode = data.items.find(
      (item: EpisodeData) => item.episodeGUID === params.episode
    );
    return {
      charset: "utf-8",
      title: episode?.title,
      description: episode?.description,
      "meta:image": episode?.image,
      viewport: "width=device-width,initial-scale=1",
    };
  }
  return {
    charset: "utf-8",
    title: data.title,
    description: data.description,
    "meta:image": data.image,
    viewport: "width=device-width,initial-scale=1",
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const podcastName = request.url.split("/").at(3) || "hakapit";
  if (!podcastName) return {};
  if (params?.episode) {
    return await fetchEpisode(podcastName, params.episode);
  }
  return await fetchPage(podcastName);
};

export default function App() {
  const data = useLoaderData();
  scrollHandler(
    () => {
      document.getElementById("page-header")!.classList.add("small");
    },
    () => {
      document.getElementById("page-header")!.classList.remove("small");
    }
  );

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <script src="https://platform.twitter.com/widgets.js" />
      </head>
      <body style={{ direction: "rtl" }}>
        <Header data={data} />
        <main className="bg-accent2">
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
