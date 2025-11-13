import { FeedPage, PreviewPage } from "~/components/rss/feed/feed";
import type { PodcastName } from "~/providers/convex/feed";

async function Feed({
	limit = 1,
	preview = false,
	podcast,
}: {
	limit?: number;
	preview?: boolean;
	podcast: PodcastName;
}) {
	if (preview) return <PreviewPage limit={limit} podcast={podcast} />;
	return <FeedPage limit={limit} podcast={podcast} />;
}

export default async function RSSFeed({
	limit = 1,
	preview = false,
	podcast,
}: {
	limit?: number;
	preview?: boolean;
	podcast: PodcastName;
}) {
	return (
		<div className="flex flex-col items-center gap-3">
			<Feed limit={limit} preview={preview} podcast={podcast} />
		</div>
	);
}
