import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import type { RouteMatch } from "@remix-run/react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  useParams,
} from "@remix-run/react";
import { fetchEpisode, fetchPage } from "~/api/fetch-page";
import type { EpisodeData } from "~/api/types";
import { GlobalLoading } from "~/components/global-loader";
import Header from "~/components/header";
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
      "meta:image": episode?.itunes?.image,
      viewport: "width=device-width,initial-scale=1",
    };
  }
  return {
    charset: "utf-8",
    title: data.title,
    description: data.description,
    "meta:image": data.image.url,
    viewport: "width=device-width,initial-scale=1",
  };
};

export const mainLoader: LoaderFunction = async ({ request, params }) => {
  const podcastName = request.url.split("/").at(3) || "hakapit";
  if (!podcastName) return {};
  if (params?.episode) {
    return await fetchEpisode(podcastName, params.episode);
  }
  const feed = await fetchPage(podcastName);
  return feed;
};

export const loader: LoaderFunction = async ({ request, params, context }) => {
  return await mainLoader({ request, params, context });
};
function lastMatchWithData(matches: RouteMatch[]) {
  for (let i = matches.length - 1; i >= 0; i--) {
    if (matches[i].data) return matches[i].data;
  }
}
export default function App() {
  const matches = useMatches();
  const data = lastMatchWithData(matches);

  const { episode } = useParams();
  const imageUrl = episode ? data?.items[0]?.itunes?.image : data?.image.url;

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <link rel="icon" href={imageUrl} />
      </head>
      <body className="body">
        <GlobalLoading />
        {data && <Header data={data} />}
        <main className="bg-accentBg">
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <script src="https://platform.twitter.com/widgets.js"></script>
        <LiveReload />
      </body>
    </html>
  );
}
