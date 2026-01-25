import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProvider } from "convex/react";
import { useMemo } from "react";

const metaEnv =
	typeof import.meta === "undefined" ? undefined : (import.meta.env as Record<string, string | undefined> | undefined);

const CONVEX_URL = process.env.CONVEX_URL || metaEnv?.CONVEX_URL || metaEnv?.VITE_CONVEX_URL;

export default function AppConvexProvider({ children }: { children: React.ReactNode }) {
	const convexQueryClient = useMemo(() => {
		if (!CONVEX_URL) {
			console.warn("Convex URL missing; ConvexProvider will be skipped (likely in CI/e2e)");
			return null;
		}
		return new ConvexQueryClient(CONVEX_URL);
	}, []);

	if (!convexQueryClient) {
		return <>{children}</>;
	}

	return <ConvexProvider client={convexQueryClient.convexClient}>{children}</ConvexProvider>;
}
