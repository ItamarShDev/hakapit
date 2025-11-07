import { Suspense } from "react";
import { TwitterLoader } from "~/[podcast]/TwitterLoader";
import { PlayerProvider } from "~/components/player/provider";
import { MainLayout } from "~/layouts/main";
import type { PodcastName } from "~/providers/rss/feed";

export async function generateStaticParams() {
	// Return a placeholder for build-time validation
	// Real params will be generated at runtime via ISR
	return [{ podcast: "hakapit" }];
}

export default async function Layout(props: LayoutProps<"/[podcast]">) {
	const params = await props.params;
	const { children } = props;

	return (
		<MainLayout params={params as { podcast: PodcastName }}>
			<Suspense fallback={null}>
				<TwitterLoader />
			</Suspense>
			<PlayerProvider>{children}</PlayerProvider>
		</MainLayout>
	);
}
