import { createFileRoute, redirect } from "@tanstack/react-router";
import Episode from "~/app/components/Episode";
import type { PodcastName } from "~/app/providers/rss/feed";
import { fetchEpisode } from "~/app/providers/rss/feed";
import { validatePodcastParam } from "~/app/utils/validatie-podcast-param";

export const Route = createFileRoute("/$podcast/episodes/$id/")({
	component: PodcastEpisode,
	beforeLoad: async ({ params }) => {
		if (!validatePodcastParam(params.podcast)) {
			throw redirect({ to: "/" });
		}
		return { podcast: params.podcast as PodcastName };
	},
	loader: async ({ params }) => {
		const episodeNumber = Number.parseInt(params.id, 10);
		if (Number.isNaN(episodeNumber)) {
			throw redirect({ to: "/" });
		}
		const metadata = await fetchEpisode({ podcastName: params.podcast, episodeNumber });

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

		const contentWithoutNewLine = metadata?.description?.replace(/\n/g, " ");
		return {
			title: metadata.title,
			meta: [
				{ name: "description", content: contentWithoutNewLine },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: `https://hakapit.online/${params.podcast}/episodes/${params.id}` },
				{ property: "og:title", content: metadata.title },
				{ property: "og:description", content: metadata.description || "" },
				{ property: "og:image", content: metadata.imageUrl || "" },
			],
		};
	},
});

function PodcastEpisode() {
	const { metadata } = Route.useLoaderData();
	if (!metadata) {
		return null;
	}

	return <Episode data={metadata} />;
}
