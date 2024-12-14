import type { Metadata } from "next";
import Episode from "~/components/rss/episode";
import { type PodcastName, fetchLatestEpisode } from "~/server/rss/feed";
export const revalidate = 6000;

export async function generateMetadata(props: { params: Promise<{ podcast: string }> }): Promise<Metadata> {
	const params = await props.params;
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

export default async function RouteComponent(props: { params: Promise<{ podcast: string }> }) {
	const params = await props.params;
	const episode = await fetchLatestEpisode(params.podcast as PodcastName);
	if (!episode) {
		return <div>Not found</div>;
	}

	return <Episode data={episode} />;
}
