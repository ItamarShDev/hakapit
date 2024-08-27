import { PlayerProvider } from "~/components/player/provider";
import { MainLayout } from "~/layouts/main";
import type { PodcastName } from "~/server/rss/feed";

export default function RootLayout({
	children,
	params: { podcast },
}: {
	children: React.ReactNode;
	params: { podcast: PodcastName };
}) {
	return (
		<MainLayout params={{ podcast }}>
			<PlayerProvider>{children}</PlayerProvider>
		</MainLayout>
	);
}
