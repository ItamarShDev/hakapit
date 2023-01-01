import type { LinksFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import styles from "styles/themes/balcony-albums.css";
import type { Feed } from "~/api/types";
import FeedComp from "~/components/rss/feed";
import { TwitterTimelineEmbed } from "~/components/twitter-timeline-embed";
import { loader as loaderFunction } from "~/root";
export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];
export const loader = loaderFunction;
export default function Index() {
  const data = useLoaderData<Feed>();
  return (
    <section className="feed-page">
      <FeedComp podcastName="balcony-albums" episodes={data?.items} />
      <TwitterTimelineEmbed podcastName="KapitPod" />
    </section>
  );
}
