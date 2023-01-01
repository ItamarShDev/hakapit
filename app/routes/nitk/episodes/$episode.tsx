import { useLoaderData } from "@remix-run/react";

import type { EpisodeData } from "~/api/types";
import { loader as loaderFunction } from "~/root";
import { Episode } from "~/components/rss/Episode";
import styles from "styles/themes/nitk.css";
import type { LinksFunction } from "@remix-run/node";
export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const loader = loaderFunction;
export default function Index() {
  const data = useLoaderData<EpisodeData>();

  return (
    <section className="feed-page">
      <Episode episode={data} podcastName="nitk" />
    </section>
  );
}
