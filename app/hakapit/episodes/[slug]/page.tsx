import { Episode } from "components/rss/Episode";
import Head from "next/head";
import { fetchEpisode } from "api/hakapit/feed";
import { EpisodeData } from "api/types";
export default async function Index({ params }: { params: { slug: string } }) {
  const episodeData: EpisodeData = await fetchEpisode(params.slug);
  return (
    <>
      <Head>
        <meta
          property="og:image"
          content={`https://www.hakapit.tech/api/og-image?title=${episodeData?.title}`}
        />
      </Head>
      <Episode episode={episodeData} podcastName="hakapit" />
    </>
  );
}
