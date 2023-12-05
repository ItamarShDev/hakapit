import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { fetchPage } from "~/api/rss/fetch-page";
import RSSFeed from "~/components/rss/feed";
import { TwitterTimelineEmbed } from "~/components/twitter-timeline-embed";

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  const metadata = data?.metadata;
  return [
    {
      meta: "og:url",
      content: `https://hakapit.online/${params?.podcast}`,
    },
    { meta: "description", content: metadata?.description },
    { meta: "author", content: metadata?.itunes?.author },
    { meta: "image", content: metadata?.itunes?.image },
    { title: metadata?.title },
    { tagName: "link", rel: "icon", href: metadata?.itunes.image },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  if (!params.podcast) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const metadata = await fetchPage(params.podcast, 1);
  return { metadata, podcast: params.podcast } as {
    limit: number;
    metadata: typeof metadata;
    podcast: "hakapit" | "balcony-albums" | "nitk";
  };
};

export default function RouteComponent() {
  const { podcast, metadata } = useLoaderData<typeof loader>();
  return (
    <section className="feed-page">
      <RSSFeed podcastName={podcast} data={metadata} preview />
      <TwitterTimelineEmbed podcastName={podcast} />
    </section>
  );
}
