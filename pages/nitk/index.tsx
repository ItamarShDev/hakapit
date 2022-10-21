import type { GetStaticProps } from "next";
import FeedComp from "components/rss/feed";
import styles from "styles/nitk.module.css";
import dynamic from "next/dynamic";
import { useFeedByPage } from "queries/nitk";
import { Feed, fetchFeed } from "pages/api/nitk/feed";
const TwitterTimelineEmbed = dynamic(
  () =>
    import("components/twitter-timeline-embed").then(
      (mod) => mod.TwitterTimelineEmbed
    ),
  {
    loading: () => <div>טוען ציוצים של הכפית...</div>,
  }
);
const Home = ({ feed }: { feed: Feed }) => {
  const { data, isFetched } = useFeedByPage(1);
  const feedData = isFetched ? data : feed;
  return (
    <section className={styles.content}>
      {isFetched ? (
        <FeedComp podcastName="nitk" episodes={feedData?.items} />
      ) : (
        <section className={styles.content}>טוען פרקים...</section>
      )}
      <TwitterTimelineEmbed podcastName="ShchunaPod" />
    </section>
  );
};

export default Home;
export const getStaticProps: GetStaticProps = async () => {
  if (!process.env.HAKAPIT_RSS) return { props: {} };
  const feed = await fetchFeed();

  return {
    props: {
      feed,
    },
  };
};
