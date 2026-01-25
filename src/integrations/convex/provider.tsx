import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProvider } from "convex/react";
import { useMemo } from "react";
import { resolveConvexUrl } from "~/app/providers/convex/env";

const CONVEX_URL = resolveConvexUrl("warn") ?? undefined;

export default function AppConvexProvider({ children }: { children: React.ReactNode }) {
	const convexQueryClient = useMemo(() => {
		if (!CONVEX_URL) {
			return null;
		}
		return new ConvexQueryClient(CONVEX_URL);
	}, []);

	if (!convexQueryClient) {
		return <>{children}</>;
	}

	return <ConvexProvider client={convexQueryClient.convexClient}>{children}</ConvexProvider>;
}
