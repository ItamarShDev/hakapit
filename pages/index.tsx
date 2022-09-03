import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { fetchFeed } from "pages/api/feed";
import Feed from "components/rss/feed";
import { TwitterTimelineEmbed } from "components/twitter-timeline-embed";
import styles from "styles/index.module.css";
const Home: NextPage = ({
  rss,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { items: episodes } = rss;

  return (
    <>
      <main className={styles.main}>
        <Feed episodes={episodes} />
        <TwitterTimelineEmbed />
      </main>
    </>
  );
};

export default Home;
export const getServerSideProps: GetServerSideProps = async () => {
  if (!process.env.RSS) return { props: {} };
  const rss = await fetchFeed(process.env.RSS, 1);
  return {
    props: {
      rss,
    },
  };
};
