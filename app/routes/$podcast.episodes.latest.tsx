import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { PodcastName, fetchLatestEpisode } from "~/api/rss/feed";
import Episode from "~/components/rss/episode";

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
	const contentWithoutNewLine = data?.description?.replace(/\n/g, " ");
	return [
		{ charset: "utf-8" },
		{ name: "viewport", content: "width=device-width, initial-scale=1.0" },
		{ title: data?.title },
		{ name: "image", content: data?.imageUrl },
		{ name: "description", content: contentWithoutNewLine },
		{ tagName: "link", rel: "icon", href: data?.imageUrl },
		{ tagName: "link", rel: "icon", href: data?.imageUrl },
		// open graph
		{
			property: "og:url",
			content: `https://hakapit.online/${params?.podcast}/episodes/latest`,
		},
		{ property: "og:type", content: "website" },
		{ property: "og:title", content: data?.title },
		{ property: "og:description", content: contentWithoutNewLine },
		{ property: "og:image", content: data?.imageUrl },

		// twitter
		{ property: "twitter:card", content: "summary_large_image" },
		{
			property: "twitter:url",
			content: `https://hakapit.online/${params?.podcast}/episodes/${params.id}`,
		},
		{ property: "twitter:title", content: data?.title },
		{ property: "twitter:description", content: contentWithoutNewLine },
		{ property: "twitter:image", content: data?.imageUrl },
	];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
	if (!params.podcast) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	return await fetchLatestEpisode(params.podcast as PodcastName);
};

export default function RouteComponent() {
	const episode = useLoaderData<typeof loader>();
	return <Episode data={episode} />;
}
