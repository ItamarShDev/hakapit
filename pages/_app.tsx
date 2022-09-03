import "../styles/globals.css";
import type { AppProps } from "next/app";
import ErrorBoundary from "components/layouts/error-boudary";
import Header from "components/header";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  if (!pageProps?.rss) return <div></div>;

  const { description, title, itunes } = pageProps?.rss;
  const { author, image } = itunes;
  const imageText = pageProps?.rss?.episode?.title || title;
  return (
    <ErrorBoundary>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="author" content={author} />
        <meta
          property="og:image"
          content={`https://hakapit.tech/api/og-image?title=${imageText}`}
        />
        <link rel="icon" href={image} />
      </Head>
      <Header data={{ author, description, title, image }} />
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;
