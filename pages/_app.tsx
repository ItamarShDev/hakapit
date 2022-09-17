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
export type HomePageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;
function MyApp(props: HomePageProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={props?.pageProps?.dehydratedState}>
        <Layout {...props} />
      </Hydrate>
    </QueryClientProvider>
  );
}

export default MyApp;
