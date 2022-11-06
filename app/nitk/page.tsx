import FeedComp from "components/rss/feed";
import styles from "styles/nitk.module.css";
import { fetchFeed } from "api/nitk/feed";
import { TwitterTimelineEmbed } from "components/twitter-timeline-embed";
import { Feed } from "api/types";
const Home = async () => {
  const feedData: Feed = await fetchFeed();
  return (
    <section className={styles.content}>
      <FeedComp podcastName="nitk" episodes={feedData?.items} />
      <TwitterTimelineEmbed podcastName="ShchunaPod" />
    </section>
  );
};

export default Home;
