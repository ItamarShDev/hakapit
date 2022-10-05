import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Header from "components/header";
import ErrorBoundary from "layouts/error-boudary";
import Head from "next/head";
import { useRouter } from "next/router";
import { HomePageProps } from "pages/_app";
import { useFeedByRoute } from "queries";
import styles from "./style.module.css";
function useTheme() {
  const { pathname } = useRouter();
  const isNitk = pathname?.startsWith("/nitk");

  const colors = {
    primary: "hsl(350, 85%, 25%)",
    primaryOpaque: "hsl(350 85% 42% / 0.2)",
    secondary: "#00b2a9",
    tertiary: "#f6eb61",
    background: "hwb(349 1% 91%)",
    text: "white",
  };
  if (isNitk)
    return {
      primary: "rgb(56, 0, 60)",
      primaryOpaque: "hsl(296 100% 20% / 0.3)",
      secondary: "rgb(233, 0, 82)",
      text: "rgb(4, 245, 255)",
      background: "hsl(296, 100%, 5%)",
      tertiary: "rgb(0, 255, 133)",
    };
  return colors;
}
export function Layout({ Component, pageProps }: HomePageProps) {
  const colors = useTheme();
  const { data: rss } = useFeedByRoute(1);
  return (
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
      <main className={styles.page}>
        <Header
          data={{
            author: rss?.itunes?.author,
            description: rss?.description,
            title: rss?.title,
            image: rss?.itunes?.image,
          }}
        />
        <Component {...pageProps} rss={rss} />
      </main>
      <style jsx global>
        {`
          :root {
            --color-primary: ${colors.primary};
            --color-primary-opaque: ${colors.primaryOpaque};
            --color-secondary: ${colors.secondary};
            --color-tertiary: ${colors.tertiary};
            --color-background: ${colors.background};
            --color-text: ${colors.text};
          }
          body {
            transition: color 0.2s ease-in-out, background 0.2s ease-in-out;
          }
        `}
      </style>
      <ReactQueryDevtools initialIsOpen={false} />
    </ErrorBoundary>
  );
}
