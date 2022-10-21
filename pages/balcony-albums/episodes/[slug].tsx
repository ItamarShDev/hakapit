import { Episode } from "components/rss/Episode";
import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  EpisodeData,
  fetchEpisode,
  fetchFeed,
} from "pages/api/balcony-albums/feed";
import { useEpisode } from "queries/balcony-albums";
export default function Index({ episode }: { episode: EpisodeData }) {
  const { query } = useRouter();
  const { data } = useEpisode(query.slug as string);
  const episodeData = data || episode;
  return (
    <>
      <Head>
        <meta
          property="og:image"
          content={`https://www.hakapit.tech/api/og-image?title=${episode?.title}`}
        />
      </Head>
      <Episode episode={episodeData} podcastName="nitk" />
    </>
  );
}
export async function getStaticPaths() {
  const feed = await fetchFeed();
  return {
    paths: feed.items.map((episode) => ({
      params: { slug: episode?.guid.split("/").pop() },
    })),
    fallback: true,
  };
}
export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!process.env.NITK_RSS) return { props: {} };
  const slug = params?.slug as string;
  const episode = await fetchEpisode(slug);

  return {
    props: {
      episode,
    },
  };
};
