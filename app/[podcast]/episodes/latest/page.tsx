import type { Metadata } from "next";
import { Suspense } from "react";
import Episode from "~/components/rss/episode";
import { fetchLatestEpisode, type PodcastName } from "~/providers/rss/feed";

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

async function Page({ params }: { params: PageProps<"/[podcast]/episodes/latest">["params"] }) {
	const resolvedParams = await params;
	const episode = await fetchLatestEpisode(resolvedParams.podcast as PodcastName);
	if (!episode) {
		return <div>Not found</div>;
	}
	return <Episode data={episode} />;
}

export default async function RouteComponent(props: PageProps<"/[podcast]/episodes/latest">) {
	return (
		<Suspense>
			<Page params={props.params} />
		</Suspense>
	);
}
