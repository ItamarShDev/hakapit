import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import RSSFeed from "~/components/rss/feed";
import { TwitterTimelineEmbed } from "~/components/twitter-timeline-embed";
import { usePodcastData } from "~/hooks";
import { fetchFeed, type PodcastName } from "~/server/rss/feed";

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
	const metadata = data?.metadata;
	return [
		{ name: "viewport", content: "width=device-width, initial-scale=1.0" },
		{ charset: "utf-8" },
		{ title: metadata?.title },
		{ name: "description", content: metadata?.description },
		{ name: "author", content: metadata?.authorName },
		{ name: "image", content: metadata?.imageUrl },
		{ tagName: "link", rel: "icon", href: metadata?.imageUrl },

		// open graph
		{
			property: "og:url",
			content: `https://hakapit.online/${params?.podcast}`,
		},
		{ property: "og:type", content: "website" },
		{ property: "og:title", content: metadata?.title },
		{ property: "og:description", content: metadata?.description },
		{ property: "og:image", content: metadata?.imageUrl },

		// twitter
		{ property: "twitter:card", content: "summary_large_image" },
		{
			property: "twitter:url",
			content: `https://hakapit.online/${params?.podcast}`,
		},
		{ property: "twitter:title", content: metadata?.title },
		{ property: "twitter:description", content: metadata?.description },
		{ property: "twitter:image", content: metadata?.imageUrl },
	];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
	if (!params.podcast) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}

	const metadata = await fetchFeed(params.podcast as PodcastName, 1);
	return { metadata, podcast: params.podcast };
};
export default function RouteComponent() {
	const { podcast, metadata } = usePodcastData({ limit: 1 });
	return (
		<section className="feed-page">
			<RSSFeed data={metadata} preview />
			<TwitterTimelineEmbed podcastName={podcast} />
		</section>
	);
}
