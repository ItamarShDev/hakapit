import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import styles from "styles/themes/nitk.css";
import type { Feed } from "~/api/types";
import FeedComp from "~/components/rss/feed";
import { TwitterTimelineEmbed } from "~/components/twitter-timeline-embed";

import { mainLoader } from "~/root";
export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];
export const loader: LoaderFunction = async ({ request, params, context }) => {
  return await mainLoader({ request, params, context });
};
export default function Index() {
  const data = useLoaderData<Feed>();
  return (
    <section className="feed-page">
      <FeedComp podcastName="nitk" episodes={data?.items} />
      <TwitterTimelineEmbed podcastName="ShchunaPod" />
    </section>
  );
}
