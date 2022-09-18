import "../styles/globals.css";
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Layout } from "layouts";
import { useState } from "react";
import { InferGetServerSidePropsType } from "next";
import { getServerSideProps } from "pages";
import ErrorBoundary from "layouts/error-boudary";
export type HomePageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;
function MyApp(props: HomePageProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={props?.pageProps?.dehydratedState}>
          <Layout {...props} />
        </Hydrate>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
