import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { fetchPage } from "~/api/fetch-page";
import RSSFeed from "~/components/rss/feed";

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  return [
    { meta: "description", content: data?.metadata?.description },
    { meta: "author", content: data?.metadata?.itunes?.author },
    { meta: "image", content: data?.metadata?.itunes?.image },
    {
      meta: "og:url",
      content: `https://hakapit.online/${params?.podcast}/episodes`,
    },
    { title: `פרקים של ${data?.metadata?.title}` },
    { tagName: "link", rel: "icon", href: data?.metadata?.itunes.image },
  ];
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  if (!params.podcast) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  const url = new URL(request.url);
  const limitString = url.searchParams.get("limit");
  const limit = Number(limitString);
  const metadata = await fetchPage(params.podcast, limit || 5);
  return { metadata, podcast: params.podcast, limit } as {
    limit: number;
    metadata: typeof metadata;
    podcast: "hakapit" | "balcony-albums" | "nitk";
  };
};

export default function RouteComponent() {
  const [params] = useSearchParams();
  const data = useLoaderData<typeof loader>();
  return (
    <RSSFeed
      podcastName={data.podcast}
      data={data.metadata}
      limit={parseInt(params.get("limit") || "5")}
    />
  );
}
