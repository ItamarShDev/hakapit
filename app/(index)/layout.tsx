import { PlayerProvider } from "~/components/player/provider";
import { MainLayout } from "~/layouts/main";
import type { PodcastName } from "~/server/rss/feed";

export default async function RootLayout(
    props: {
        children: React.ReactNode;
        params: Promise<{ podcast: PodcastName }>;
    }
) {
    const params = await props.params;

    const {
        podcast
    } = params;

    const {
        children
    } = props;

    return (
		<MainLayout params={{ podcast }}>
			<PlayerProvider>{children}</PlayerProvider>
		</MainLayout>
	);
}
