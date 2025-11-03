import type { Metadata } from "next";
import { Suspense } from "react";
import Episode from "~/components/rss/episode";
import { fetchEpisode } from "~/providers/rss/feed";

export async function generateStaticParams() {
	// Return a placeholder for build-time validation
	// Real params will be generated at runtime via ISR
	return [{ id: "", podcast: "hakapit" }];
}

export async function generateMetadata(props: { params: Promise<{ id: string; podcast: string }> }): Promise<Metadata> {
	const params = await props.params;
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
async function Page({ params }: { params: PageProps<"/[podcast]/episodes/[id]">["params"] }) {
	const resolvedParams = await params;
	if (!resolvedParams.podcast && !resolvedParams.id) return null;
	const data = await fetchEpisode(resolvedParams.id);
	if (!data) {
		return null;
	}
	return <Episode data={data} />;
}

export default async function RouteComponent(props: PageProps<"/[podcast]/episodes/[id]">) {
	return (
		<Suspense>
			<Page params={props.params} />
		</Suspense>
	);
}
