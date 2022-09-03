import { Episode } from "components/rss/Episode";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { fetchEpisode } from "pages/api/feed";
export default function Index({
  rss,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <meta
          property="og:image"
          content={`https://www.hakapit.tech/api/og-image?title=${rss.episode.title}`}
        />
      </Head>
      <Episode episode={rss.episode} />;
    </>
  );
}
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!process.env.RSS) return { props: {} };
  const slug = params?.slug as string;
  const rss = await fetchEpisode(process.env.RSS, slug);
  return {
    props: {
      rss,
    },
  };
};
