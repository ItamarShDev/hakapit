import { createFileRoute, redirect } from "@tanstack/react-router";
import { FeedPage } from "~/app/components/Feed";
import { fetchUpdatedFeed, type PodcastName } from "~/app/providers/rss/feed";
import { validatePodcastParam } from "~/app/utils/validatie-podcast-param";

export const Route = createFileRoute("/$podcast/")({
	component: PodcastEpisodes,
	beforeLoad: async ({ params }) => {
		if (!validatePodcastParam(params.podcast)) {
			throw redirect({ to: "/" });
		}
		return { podcast: params.podcast as PodcastName };
	},
	loader: async ({ context }) => {
		const podcastName = context.podcast;
		const metadata = await fetchUpdatedFeed(podcastName, 10);
		return { metadata };
	},
	head: ({ loaderData, params }) => {
		const metadata = loaderData?.metadata;
		if (!metadata) {
			return {
				title: params.podcast,
				meta: [
					{ name: "description", content: `${params.podcast} podcast` },
					{ name: "author", content: params.podcast },
				],
			};
		}
		return {
			title: metadata.title,
			meta: [
				{ name: "description", content: metadata.description },
				{ name: "author", content: metadata.authorName || "hakapit" },
				{ property: "og:type", content: "website" },
				{
					property: "og:url",
					content: `https://hakapit.online/${params.podcast}`,
				},
				{ property: "og:title", content: metadata.title },
				{ property: "og:description", content: metadata.description || "" },
				{ property: "og:image", content: metadata.imageUrl || "" },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: metadata.title },
				{ name: "twitter:description", content: metadata.description || "" },
				{ name: "twitter:image", content: metadata.imageUrl || "" },
				{
					name: "twitter:url",
					content: `https://hakapit.online/${params.podcast}`,
				},
			],
		};
	},
});

function PodcastEpisodes() {
	const { metadata } = Route.useLoaderData();
	const { podcast } = Route.useRouteContext();

	if (!metadata || !metadata.episodes || metadata.episodes.length === 0) {
		return null;
	}
	return <FeedPage data={metadata} podcast={podcast} />;
}
