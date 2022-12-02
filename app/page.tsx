import FeedComp from "components/rss/feed";
import styles from "styles/index.module.css";
import { fetchFeed } from "api/hakapit/feed";
import { TwitterTimelineEmbed } from "components/twitter-timeline-embed";
import { Feed } from "api/types";
import { scrollHandler } from "hooks";

export default async function Home() {
  const feedData: Feed = await fetchFeed();
  scrollHandler(
    () => {
      document.getElementById("page-header")!.classList.add(styles.scrolled);
    },
    () => {
      document.getElementById("page-header")!.classList.remove(styles.scrolled);
    }
  );
  return (
    <section className={styles.content}>
      <FeedComp podcastName="hakapit" episodes={feedData?.items} />
      <TwitterTimelineEmbed podcastName="KapitPod" />
    </section>
  );
}
