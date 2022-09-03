import "../styles/globals.css";
import type { AppProps } from "next/app";
import ErrorBoundary from "components/layouts/error-boudary";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;
