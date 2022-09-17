import "../styles/globals.css";
import type { AppProps } from "next/app";
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Layout } from "layouts";
import { useState } from "react";

function MyApp(props: AppProps) {
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
