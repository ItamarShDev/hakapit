import FeedComp from "components/rss/feed";
import styles from "styles/index.module.css";
import { fetchFeed } from "api/hakapit/feed";
import { TwitterTimelineEmbed } from "components/twitter-timeline-embed";
import { Feed } from "api/types";

export default async function Home() {
  const feedData: Feed = await fetchFeed();

  return (
    <section className={styles.content}>
      <FeedComp podcastName="hakapit" episodes={feedData?.items} />
      <TwitterTimelineEmbed podcastName="KapitPod" />
    </section>
  );
}
