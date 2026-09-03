import { createFileRoute, redirect } from "@tanstack/react-router";

import { isPodcastName } from "~/features/podcast/podcasts";

export const Route = createFileRoute("/$podcast/episodes/")({
  loader: ({ params }) => {
    if (!isPodcastName(params.podcast)) {
      throw redirect({ to: "/" });
    }
    throw redirect({ to: "/$podcast", params: { podcast: params.podcast } });
  },
});
