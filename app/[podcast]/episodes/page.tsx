import type { Metadata } from "next";
import { Suspense } from "react";
import RSSFeed from "~/components/rss/feed";
import { fetchFeed, type PodcastName } from "~/providers/convex/feed";

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

async function Page(props: PageProps<"/[podcast]/episodes">) {
	const searchParams = await props.searchParams;

	const { limit } = searchParams;

	const params = await props.params;

	const { podcast } = params;

	const episodeLimit = Number.parseInt(limit ? (Array.isArray(limit) ? limit[0] : limit) : "10", 10);
	return <RSSFeed limit={episodeLimit} podcast={podcast as PodcastName} />;
}

export default async function RouteComponent(props: PageProps<"/[podcast]/episodes">) {
	return (
		<Suspense>
			<Page {...props} />
		</Suspense>
	);
}
