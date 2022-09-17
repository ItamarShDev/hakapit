import { QueryClient, dehydrate, useQuery } from "@tanstack/react-query";
import { Episode } from "components/rss/Episode";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { EpisodeData, fetchEpisode } from "pages/api/feed";
export default function Index() {
  const { query } = useRouter();
  const { data: episode } = useQuery<EpisodeData>(["episode", query.slug], () =>
    fetchEpisode(query.slug as string)
  );
  return (
    <>
      <Head>
        <meta
          property="og:image"
          content={`https://www.hakapit.tech/api/og-image?title=${episode?.title}`}
        />
      </Head>
      <Episode episode={episode} />
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
