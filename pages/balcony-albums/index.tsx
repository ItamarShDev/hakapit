import type { GetStaticProps } from "next";
import FeedComp from "components/rss/feed";
import styles from "styles/nitk.module.css";
import dynamic from "next/dynamic";
import { useFeedByPage } from "queries/balcony-albums";
import { Feed, fetchFeed } from "pages/api/balcony-albums/feed";
const TwitterTimelineEmbed = dynamic(
  () =>
    import("components/twitter-timeline-embed").then(
      (mod) => mod.TwitterTimelineEmbed
    ),
  {
    loading: () => <div>טוען ציוצים...</div>,
  }
);
const Home = ({ feed }: { feed: Feed }) => {
  const { data, isFetched } = useFeedByPage(1);
  const feedData = isFetched ? data : feed;
  return (
    <section className={styles.content}>
      <FeedComp podcastName="balcony-albums" episodes={feedData?.items} />
      <TwitterTimelineEmbed podcastName="balconyalbums" />
    </section>
  );
};

export default Home;
export const getStaticProps: GetStaticProps = async () => {
  if (!process.env.BALCONY_RSS) return { props: {} };
  const feed = await fetchFeed();

  return {
    props: {
      feed,
    },
  };
};
