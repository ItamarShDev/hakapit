import type { GetStaticProps } from "next";
import FeedComp from "components/rss/feed";
import styles from "styles/index.module.css";
import dynamic from "next/dynamic";
import { useFeedByPage } from "queries/hakapit";
import { fetchFeed, Feed } from "pages/api/hakapit/feed";
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
      <FeedComp podcastName="hakapit" episodes={feedData?.items} />
      <TwitterTimelineEmbed podcastName="KapitPod" />
    </section>
  );
};

export default Home;
export const getStaticProps: GetStaticProps = async () => {
  if (!process.env.NITK_RSS) return { props: {} };
  const feed = await fetchFeed();
  return {
    props: {
      feed,
    },
  };
};
