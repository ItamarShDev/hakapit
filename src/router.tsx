import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ConvexProvider } from "convex/react";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const convexUrl = process.env.CONVEX_URL || import.meta.env.VITE_CONVEX_URL;
	if (!convexUrl) {
		throw new Error("CONVEX_URL is not defined");
	}
	const convexQueryClient = new ConvexQueryClient(convexUrl);
	if (!convexQueryClient) {
		throw new Error("Failed to create ConvexQueryClient");
	}
	const queryClient: QueryClient = new QueryClient({
		defaultOptions: {
			queries: {
				queryKeyHashFn: convexQueryClient.hashFn(),
				queryFn: convexQueryClient.queryFn(),
			},
		},
	});

	convexQueryClient.connect(queryClient);

	const router = routerWithQueryClient(
		createRouter({
			routeTree,
			defaultPreload: "intent",
			defaultStaleTime: 5000,
			defaultViewTransition: true,
			context: { queryClient },
			scrollRestoration: true,
			Wrap: ({ children }) => <ConvexProvider client={convexQueryClient.convexClient}>{children}</ConvexProvider>,
		}),
		queryClient,
	);

	return router;
}
