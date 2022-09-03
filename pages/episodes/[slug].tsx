import { Episode } from "components/rss/Episode";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { fetchEpisode } from "pages/api/feed";
export default function Index({
  rss,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <Episode episode={rss.episode} />;
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
