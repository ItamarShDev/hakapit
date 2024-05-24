import type { Metadata } from "next";
import Episode from "~/components/rss/episode";
import { fetchEpisode } from "~/server/rss/feed";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string; podcast: string } }): Promise<Metadata> {
	const metadata = await fetchEpisode(params.id);

	if (!metadata) {
		return {
			title: "hakapit",
			description: "hakapit podcast",
			authors: [{ name: "hakapit" }],
		};
	}

	const contentWithoutNewLine = metadata?.description?.replace(/\n/g, " ");
	return {
		title: metadata.title,
		description: contentWithoutNewLine,
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

export default async function RouteComponent({ params }: { params: { podcast: string; id: string } }) {
	if (!params.podcast && !params.id) return null;
	const data = await fetchEpisode(params.id);
	if (!data) {
		return null;
	}
	return <Episode data={data} />;
}
