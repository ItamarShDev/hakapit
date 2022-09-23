import type { GetServerSideProps } from "next";
import Feed from "components/rss/feed";
import styles from "styles/index.module.css";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { fetchFeed } from "pages/api/feed";
import { Feed as FeedType } from "pages/api/feed";
import dynamic from "next/dynamic";
const TwitterTimelineEmbed = dynamic(
  () =>
    import("components/twitter-timeline-embed").then(
      (mod) => mod.TwitterTimelineEmbed
    ),
  {
    loading: () => <div>טוען ציוצים של הכפית...</div>,
  }
);
const Home = ({ rss }: { rss: FeedType }) => {
  const { items: episodes } = rss;
  return (
    <section className={styles.content}>
      <Feed episodes={episodes} />
      <TwitterTimelineEmbed />
    </section>
  );
};

export default Home;
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );

  if (!process.env.RSS) return { props: {} };
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(["feed", 1], () => fetchFeed(1));

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
