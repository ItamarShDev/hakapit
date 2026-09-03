import { createFileRoute, redirect } from "@tanstack/react-router";

import Episode from "~/features/podcast/episode";
import { isPodcastName } from "~/features/podcast/podcasts";
import { podcastFallbackHead, podcastHead } from "~/features/podcast/seo";
import { fetchUpdatedLatestEpisode } from "~/server/rss/feed";

export const Route = createFileRoute("/$podcast/latest/")({
  component: LatestEpisode,
  beforeLoad: async ({ params }) => {
    if (!isPodcastName(params.podcast)) {
      throw redirect({ to: "/" });
    }
    return { podcast: params.podcast };
  },
  loader: async ({ context }) => {
    const episode = await fetchUpdatedLatestEpisode(context.podcast);
    return { episode };
  },
  head: ({ loaderData, params }) => {
    const episode = loaderData?.episode;
    if (!episode) return podcastFallbackHead(params.podcast);
    return podcastHead(episode, `/${params.podcast}/latest`);
  },
});

function LatestEpisode() {
  const { episode } = Route.useLoaderData();

  return <Episode data={episode} />;
}
