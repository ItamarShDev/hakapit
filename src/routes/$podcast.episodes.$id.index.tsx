import { createFileRoute, redirect } from "@tanstack/react-router";

import Episode from "~/features/podcast/episode";
import { isPodcastName } from "~/features/podcast/podcasts";
import { podcastFallbackHead, podcastHead } from "~/features/podcast/seo";
import { fetchEpisode } from "~/server/rss/feed";

export const Route = createFileRoute("/$podcast/episodes/$id/")({
  component: PodcastEpisode,
  beforeLoad: async ({ params }) => {
    if (!isPodcastName(params.podcast)) {
      throw redirect({ to: "/" });
    }
    return { podcast: params.podcast };
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
    if (!metadata) return podcastFallbackHead(params.podcast);
    return podcastHead(metadata, `/${params.podcast}/episodes/${params.id}`);
  },
});

function PodcastEpisode() {
  const { metadata } = Route.useLoaderData();
  if (!metadata) {
    return null;
  }

  return <Episode data={metadata} />;
}
