import Script from "next/script";
import { PlayerProvider } from "~/components/player/provider";
import { MainLayout } from "~/layouts/main";
import type { PodcastName } from "~/providers/rss/feed";

export default async function Layout(props: { children: React.ReactNode; params: Promise<{ podcast: string }> }) {
	const params = await props.params;
	const { children } = props;

	const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	return (
		<MainLayout params={params as { podcast: PodcastName }}>
			<Script src={`https://platform.twitter.com/widgets.js?v=${id}`} />
			<PlayerProvider>{children}</PlayerProvider>
		</MainLayout>
	);
}
