import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import styles from "styles/themes/hakapit.css";
import type { Feed } from "~/api/types";
import FeedComp from "~/components/rss/feed";
import { TwitterTimelineEmbed } from "~/components/twitter-timeline-embed";
import { mainLoader } from "~/root";
export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];
export const loader: LoaderFunction = async ({ request, params, context }) => {
  return await mainLoader({ request, params, context });
};
export default function Page() {
  const data = useLoaderData<Feed>();
  return (
    <section className="feed-page">
      <FeedComp podcastName="hakapit" episodes={data?.items} />
      <TwitterTimelineEmbed podcastName="KapitPod" />
    </section>
  );
}
