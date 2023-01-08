import { useLoaderData } from "@remix-run/react";
import type { Feed } from "~/api/types";
import { mainLoader } from "~/root";
import { Episode } from "~/components/rss/Episode";
import styles from "styles/themes/balcony-albums.css";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const loader: LoaderFunction = async ({ request, params, context }) => {
  return await mainLoader({ request, params, context });
};
export default function Index() {
  const data = useLoaderData<Feed>();
  return (
    <section className="full-page-episode">
      <Episode episode={data.items[0]} podcastName="balcony-albums" />
    </section>
  );
}
