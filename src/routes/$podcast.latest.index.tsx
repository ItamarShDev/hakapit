import { createFileRoute, redirect } from "@tanstack/react-router";
import Episode from "~/app/components/Episode";
import { fetchLatestEpisode, type PodcastName } from "~/app/providers/rss/feed";
import { validatePodcastParam } from "~/app/utils/validatie-podcast-param";

export const Route = createFileRoute("/$podcast/latest/")({
	component: LatestEpisode,
	beforeLoad: async ({ params }) => {
		if (!validatePodcastParam(params.podcast)) {
			throw redirect({ to: "/" });
		}
		return { podcast: params.podcast as PodcastName };
	},
	loader: async ({ context }) => {
		const episode = await fetchLatestEpisode(context.podcast);
		return { episode };
	},
	head: ({ loaderData, params }) => {
		const episode = loaderData?.episode;
		if (!episode) {
			return {
				title: params.podcast,
				meta: [
					{ name: "description", content: `${params.podcast} podcast` },
					{ name: "author", content: params.podcast },
				],
			};
		}
		return {
			title: episode.title,
			meta: [
				{ name: "description", content: episode.description },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: `https://hakapit.online/${params.podcast}/latest` },
				{ property: "og:title", content: episode.title },
				{ property: "og:description", content: episode.description || "" },
				{ property: "og:image", content: episode.imageUrl || "" },
			],
		};
	},
});

function LatestEpisode() {
	const { episode } = Route.useLoaderData();

	return <Episode data={episode as any} />;
}
