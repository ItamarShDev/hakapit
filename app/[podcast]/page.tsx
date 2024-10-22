import type { Metadata, Viewport } from "next";
import RSSFeed from "~/components/rss/feed";
import { TwitterTimelineEmbed } from "~/components/twitter-timeline-embed";
import { type PodcastName, fetchFeed } from "~/server/rss/feed";
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1.0,
	themeColor: "var(--color-primary)",
};

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

function YouTubeChannel({ podcast }: { podcast: "hakapit" | "balcony-albums" | "nitk" }) {
	if (podcast !== "hakapit") return null;

	return (
		<div className="flex flex-col gap-4">
			<h2 className="text-2xl font-bold"> יוטיוב</h2>
			<div className="aspect-video w-full">
				<iframe
					title="YouTube video player"
					src="https://www.youtube.com/embed/videoseries?list=UULFbQOKsqsqd2QIAX8g9R0o4Q"
					width="100%"
					height="100%"
					// @ts-ignore
					gesture="media"
					allow="encrypted-media"
					allowFullScreen
				/>
			</div>
		</div>
	);
}
export default async function RouteComponent(props: {
	params: Promise<{ podcast: "hakapit" | "balcony-albums" | "nitk" }>;
}) {
	const params = await props.params;

	const { podcast } = params;

	return (
		<section className="feed-page">
			<div>
				<RSSFeed preview podcast={podcast} />
				<YouTubeChannel podcast={podcast} />
			</div>
			<TwitterTimelineEmbed podcastName={podcast} />
		</section>
	);
}
