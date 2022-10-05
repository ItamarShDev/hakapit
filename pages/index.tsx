import type { GetServerSideProps } from "next";
import Feed from "components/rss/feed";
import styles from "styles/index.module.css";
import { dehydrate } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { prefetchFeed, useFeedByPage } from "queries/hakapit";
const TwitterTimelineEmbed = dynamic(
  () =>
    import("components/twitter-timeline-embed").then(
      (mod) => mod.TwitterTimelineEmbed
    ),
  {
    loading: () => <div>טוען ציוצים של הכפית...</div>,
  }
);
const Home = () => {
  const { data, isFetching, isFetched } = useFeedByPage(1);
  return (
    <section className={styles.content}>
      {isFetched ? (
        <Feed podcastName="hakapit" episodes={data?.items} />
      ) : (
        <section className={styles.content}>טוען פרקים...</section>
      )}
      <TwitterTimelineEmbed podcastName="KapitPod" />
    </section>
  );
};

export default Home;
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );

  if (!process.env.NITK_RSS) return { props: {} };
  const queryClient = await prefetchFeed();

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
