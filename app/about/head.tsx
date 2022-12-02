import { fetchFeed } from "api/hakapit/feed";

export default async function Head() {
  const metadata = await fetchFeed();
  return (
    <>
      <title>{metadata?.title}</title>
      <meta name="description" content={metadata?.description} />
      <meta name="author" content={metadata?.itunes?.image} />
      <meta property="og:image" content={metadata?.itunes?.image} />
      <link rel="icon" href={metadata?.itunes?.image} />
    </>
  );
}
