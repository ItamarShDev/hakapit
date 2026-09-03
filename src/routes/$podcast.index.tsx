import { createFileRoute, redirect } from "@tanstack/react-router";

import { FeedPage } from "~/features/podcast/feed";
import { isPodcastName } from "~/features/podcast/podcasts";
import { podcastFallbackHead, podcastHead } from "~/features/podcast/seo";
import { fetchUpdatedFeed } from "~/server/rss/feed";

export const Route = createFileRoute("/$podcast/")({
  component: PodcastEpisodes,
  beforeLoad: async ({ params }) => {
    if (!isPodcastName(params.podcast)) {
      throw redirect({ to: "/" });
    }
    return { podcast: params.podcast };
  },
  loader: async ({ context }) => {
    const podcastName = context.podcast;
    const metadata = await fetchUpdatedFeed(podcastName, 10);
    return { metadata };
  },
  head: ({ loaderData, params }) => {
    const metadata = loaderData?.metadata;
    if (!metadata) return podcastFallbackHead(params.podcast);
    return podcastHead(metadata, `/${params.podcast}`);
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
