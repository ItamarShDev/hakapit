import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import type { Jsonify } from "type-fest";
import { fetchEpisode } from "~/api/rss/feed";
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
			content: `https://hakapit.online/${params?.podcast}/episodes/${params.id}`,
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
	if (!params.podcast || !params.id) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	return await fetchEpisode(params.id);
};

export type LoaderData = Jsonify<Awaited<ReturnType<typeof loader>>>;

export default function RouteComponent() {
	const params = useParams();
	const data = useLoaderData<typeof loader>();
	if (!params.podcast) return null;
	return <Episode data={data} />;
}
