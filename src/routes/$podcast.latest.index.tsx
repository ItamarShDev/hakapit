import { createFileRoute, redirect } from "@tanstack/react-router";

import Episode from "~/features/podcast/episode";
import { validatePodcastParam } from "~/features/podcast/validate-podcast-param";
import { type PodcastName, fetchUpdatedLatestEpisode } from "~/server/rss/feed";

export const Route = createFileRoute("/$podcast/latest/")({
  component: LatestEpisode,
  beforeLoad: async ({ params }) => {
    if (!validatePodcastParam(params.podcast)) {
      throw redirect({ to: "/" });
    }
    return { podcast: params.podcast as PodcastName };
  },
  loader: async ({ context }) => {
    const episode = await fetchUpdatedLatestEpisode(context.podcast);
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
        { name: "description", content: episode.description ?? undefined },
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

  return <Episode data={episode} />;
}
