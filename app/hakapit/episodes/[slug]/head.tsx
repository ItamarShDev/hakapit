import { fetchEpisode } from "api/hakapit/feed";

export default async function Head({ params }: { params: { slug: string } }) {
  const metadata = await fetchEpisode(params.slug);
    return (
    <>
      <title>{metadata?.title}</title>
      <meta name="description" content={metadata?.contentSnippet} />
      <meta name="author" content={metadata?.itunes?.image} />
      <meta property="og:image" content={metadata?.itunes?.image} />
      <link rel="icon" href={metadata?.itunes?.image} />
    </>
  );
}
