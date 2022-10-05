import { QueryClient, dehydrate } from "@tanstack/react-query";
import { Episode } from "components/rss/Episode";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { fetchEpisode } from "pages/api/hakapit/feed";
import { useEpisode } from "queries/hakapit";
export default function Index() {
  const { query } = useRouter();
  const { data: episode } = useEpisode(query.slug as string);

  return (
    <>
      <Head>
        <meta
          property="og:image"
          content={`https://www.hakapit.tech/api/og-image?title=${episode?.title}`}
        />
      </Head>
      <Episode episode={episode} podcastName="hakapit" />
    </>
  );
}
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!process.env.RSS) return { props: {} };
  const slug = params?.slug as string;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(["episode", slug], () => fetchEpisode(slug));

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
