import { ConvexReactClient, ConvexProvider } from "convex/react";
import { useMemo } from "react";

import { resolveConvexUrl } from "~/lib/convex-url";

const CONVEX_URL = resolveConvexUrl("warn") ?? undefined;
let browserClient: ConvexReactClient | null = null;

export default function AppConvexProvider({ children }: { children: React.ReactNode }) {
  const convexClient = useMemo(() => {
    if (!CONVEX_URL) {
      return null;
    }
    if (typeof window !== "undefined") {
      browserClient ??= new ConvexReactClient(CONVEX_URL);
      return browserClient;
    }
    return new ConvexReactClient(CONVEX_URL);
  }, []);

  if (!convexClient) {
    return <>{children}</>;
  }

  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
}
