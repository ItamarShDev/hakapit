import { createFileRoute, redirect } from "@tanstack/react-router";

import Episode from "~/features/podcast/episode";
import { isPodcastName } from "~/features/podcast/podcasts";
import { podcastHead } from "~/lib/seo";
import { fetchEpisode } from "~/server/podcasts";

export const Route = createFileRoute("/$podcast/episodes/$id/")({
  component: PodcastEpisode,
  beforeLoad: async ({ params }) => {
    if (!isPodcastName(params.podcast)) {
      throw redirect({ to: "/" });
    }
    return { podcast: params.podcast };
  },
  loader: async ({ params, context }) => {
    const episodeNumber = Number.parseInt(params.id, 10);
    if (Number.isNaN(episodeNumber)) {
      throw redirect({ to: "/" });
    }
    const metadata = await fetchEpisode(context.podcast, episodeNumber);

    return { metadata };
  },
  head: ({ loaderData, params }) => {
    const metadata = loaderData?.metadata;
    return podcastHead(metadata, params.podcast, `/${params.podcast}/episodes/${params.id}`);
  },
});

function PodcastEpisode() {
  const { metadata } = Route.useLoaderData();
  if (!metadata) {
    return null;
  }

  return <Episode data={metadata} />;
}
