import { useLoaderData } from "@remix-run/react";
import type { Feed } from "~/api/types";
import { Episode } from "~/components/rss/Episode";
import { loader as loaderFunction } from "~/root";
import styles from "styles/themes/hakapit.css";
import type { LinksFunction } from "@remix-run/node";
export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const loader = loaderFunction;
export default function Index() {
  const data = useLoaderData<Feed>();
  return (
    <section className="full-page-episode">
      <Episode episode={data.items[0]} podcastName="hakapit" />
    </section>
  );
}
