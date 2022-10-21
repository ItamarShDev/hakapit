import "../styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "layouts";
import { useState } from "react";
import ErrorBoundary from "layouts/error-boudary";
import NextProgress from "next-progress";
import { AppProps } from "next/app";
export type HomePageProps = AppProps;
function MyApp(props: HomePageProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NextProgress delay={300} />
        <Layout {...props} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
