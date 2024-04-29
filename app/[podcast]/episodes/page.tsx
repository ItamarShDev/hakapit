import type { Metadata } from "next";
import RSSFeed from "~/components/rss/feed";
import { fetchFeed, type PodcastName } from "~/server/rss/feed";
export async function generateMetadata({ params }: { params: { podcast: string } }): Promise<Metadata> {
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

export default async function RouteComponent({
	params: { podcast },
	searchParams: { limit },
}: { params: { podcast: "hakapit" | "balcony-albums" | "nitk" }; searchParams: { limit?: string } }) {
	const episodeLimit = Number.parseInt(limit || "5");
	const metadata = await fetchFeed(podcast as PodcastName, episodeLimit || 5);
	return <RSSFeed data={metadata} limit={episodeLimit} podcast={podcast} />;
}
