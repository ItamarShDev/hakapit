import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { PodcastName, fetchFeed } from "~/api/rss/feed";
import RSSFeed from "~/components/rss/feed";
import { usePodcastData } from "~/hooks";

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
	return [
		{ charset: "utf-8" },
		{ name: "viewport", content: "width=device-width, initial-scale=1.0" },
		{ title: `פרקים של ${data?.metadata?.title}` },
		{ name: "description", content: data?.metadata?.description },
		{ name: "author", content: data?.metadata?.authorName },
		{ name: "image", content: data?.metadata?.imageUrl },
		{ tagName: "link", rel: "icon", href: data?.metadata?.imageUrl },
		// open graph
		{
			property: "og:url",
			content: `https://hakapit.online/${params?.podcast}/episodes`,
		},
		{ property: "og:type", content: "website" },
		{ property: "og:title", content: `פרקים של ${data?.metadata?.title}` },
		{ property: "og:description", content: data?.metadata?.description },
		{ property: "og:image", content: data?.metadata?.imageUrl },
		// twitter
		{ property: "twitter:card", content: "summary_large_image" },
		{
			property: "twitter:url",
			content: `https://hakapit.online/${params?.podcast}/episodes`,
		},
		{
			property: "twitter:title",
			content: `פרקים של ${data?.metadata?.title}`,
		},
		{
			property: "twitter:description",
			content: data?.metadata?.description,
		},
		{ property: "twitter:image", content: data?.metadata?.imageUrl },
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
	const metadata = await fetchFeed(params.podcast as PodcastName, limit || 5);
	return { metadata, podcast: params.podcast, limit } as {
		limit: number;
		metadata: typeof metadata;
		podcast: "hakapit" | "balcony-albums" | "nitk";
	};
};

export default function RouteComponent() {
	const [params] = useSearchParams();
	const limit = parseInt(params.get("limit") || "5");
	const { metadata } = usePodcastData({ limit: limit });
	return <RSSFeed data={metadata} limit={limit} />;
}
