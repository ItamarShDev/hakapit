import type { Metadata } from "next";
import RSSFeed from "~/components/rss/feed";
import { type PodcastName, fetchFeed } from "~/server/rss/feed";
export const revalidate = 6000;
export async function generateMetadata(props: { params: Promise<{ podcast: string }> }): Promise<Metadata> {
	const params = await props.params;
	const metadata = await fetchFeed(params.podcast as PodcastName, 1);
	if (!metadata) {
		return {
			title: "hakapit",
			description: "hakapit podcast",
			authors: [{ name: "hakapit" }],
		};
	}
	return {
		title: metadata.title,
		description: metadata.description,
		authors: [{ name: metadata.authorName || "hakapit", url: metadata.feedUrl || "" }],
		icons: metadata.imageUrl || "",
		openGraph: {
			type: "website",
			url: `https://hakapit.online/${params.podcast}`,
			title: metadata.title,
			description: metadata.description || "",
			images: metadata.imageUrl || "",
		},
	};
}

export default async function RouteComponent(props: {
	params: Promise<{ podcast: "hakapit" | "balcony-albums" | "nitk" }>;
	searchParams: Promise<{ limit?: string }>;
}) {
	const searchParams = await props.searchParams;

	const { limit } = searchParams;

	const params = await props.params;

	const { podcast } = params;

	const episodeLimit = Number.parseInt(limit || "5");
	return <RSSFeed limit={episodeLimit} podcast={podcast} />;
}
