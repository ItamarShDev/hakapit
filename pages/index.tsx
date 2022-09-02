import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Head from "next/head";
import Parser from "rss-parser";
import Header from "components/header";
import Feed from "components/rss/feed";
const Home: NextPage = ({
  rss,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { description, items: episodes, title, itunes } = rss;
  const { author, image } = itunes;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href={image.url} />
      </Head>
      <main>
        <Header data={{ author, description, title, image }} />
        <Feed episodes={episodes} />
      </main>
    </>
  );
};

export default Home;
export const getServerSideProps: GetServerSideProps = async () => {
  const parser: Parser = new Parser();
  const rss = await parser.parseURL("https://pinecast.com/feed/hakapit");
  const { items } = rss;
  const first10 = items.slice(0, 10);

  return {
    props: {
      rss: { ...rss, items: first10 },
    },
  };
};
