import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { fetchPage } from "~/api/rss/fetch-page";
import RSSFeed from "~/components/rss/feed";
import { TwitterTimelineEmbed } from "~/components/twitter-timeline-embed";

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
	const metadata = data?.metadata;
	return [
		{ name: "viewport", content: "width=device-width, initial-scale=1.0" },
		{ charset: "utf-8" },
		{ title: metadata?.title },
		{ name: "description", content: metadata?.description },
		{ name: "author", content: metadata?.itunes?.author },
		{ name: "image", content: metadata?.itunes?.image },
		{ tagName: "link", rel: "icon", href: metadata?.itunes.image },

		// open graph
		{
			property: "og:url",
			content: `https://hakapit.online/${params?.podcast}`,
		},
		{ property: "og:type", content: "website" },
		{ property: "og:title", content: metadata?.title },
		{ property: "og:description", content: metadata?.description },
		{ property: "og:image", content: metadata?.itunes?.image },

		// twitter
		{ property: "twitter:card", content: "summary_large_image" },
		{
			property: "twitter:url",
			content: `https://hakapit.online/${params?.podcast}`,
		},
		{ property: "twitter:title", content: metadata?.title },
		{ property: "twitter:description", content: metadata?.description },
		{ property: "twitter:image", content: metadata?.itunes?.image },
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
