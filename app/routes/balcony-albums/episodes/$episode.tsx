import { useLoaderData } from "@remix-run/react";
import type { Feed } from "~/api/types";
import { loader as loaderFunction } from "~/root";
import { Episode } from "~/components/rss/Episode";
import styles from "styles/themes/balcony-albums.css";
import type { LinksFunction } from "@remix-run/node";
export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const loader = loaderFunction;
export default function Index() {
  const data = useLoaderData<Feed>();
  return (
    <section className="feed-page">
      <Episode episode={data.items[0]} podcastName="balcony-albums" />
    </section>
  );
}
