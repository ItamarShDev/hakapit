import type { Metadata } from "next";
import Episode from "~/components/rss/episode";
import { type PodcastName, fetchLatestEpisode } from "~/server/rss/feed";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { podcast: string } }): Promise<Metadata> {
	const episode = await fetchLatestEpisode(params.podcast as PodcastName);
	if (!episode) {
		return {
			title: "hakapit",
			description: "hakapit podcast",
			authors: [{ name: "hakapit" }],
		};
	}
	return {
		title: episode.title,
		description: episode.description,
		icons: episode.imageUrl || "",
		openGraph: {
			type: "website",
			url: `https://hakapit.online/${params.podcast}`,
			title: episode.title,
			description: episode.description || "",
			images: episode.imageUrl || "",
		},
	};
}

export default async function RouteComponent({ params }: { params: { podcast: string } }) {
	const episode = await fetchLatestEpisode(params.podcast as PodcastName);
	if (!episode) {
		return <div>Not found</div>;
	}

	return <Episode data={episode} />;
}
