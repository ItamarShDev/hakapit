import { useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Header from "components/header";
import ErrorBoundary from "layouts/error-boudary";
import Head from "next/head";
import { Feed, fetchFeed } from "pages/api/feed";
import { HomePageProps } from "pages/_app";
import styles from "./style.module.css";
export function Layout({ Component, pageProps }: HomePageProps) {
  const { data: rss } = useQuery<Feed>(["feed", 1], () => fetchFeed(1), {
    useErrorBoundary: true,
    onError: (error) => {
      console.error(error);
    },
  });
  return (
    <main className={styles.page}>
      <ErrorBoundary>
        <Head>
          <title>{rss?.title}</title>
          <meta name="description" content={rss?.description} />
          <meta name="author" content={rss?.itunes?.image} />
          <meta
            property="og:image"
            content={`https://hakapit.tech/api/og-image?title=${rss?.title}`}
          />
          <link rel="icon" href={rss?.itunes?.image} />
        </Head>
        <Header
          data={{
            author: rss?.itunes?.author,
            description: rss?.description,
            title: rss?.title,
            image: rss?.itunes?.image,
          }}
        />
        <Component {...pageProps} rss={rss} />
        <ReactQueryDevtools initialIsOpen={false} />
      </ErrorBoundary>
    </main>
  );
}
