import Script from "next/script";
import { MainLayout } from "~/(index)/layout";
import { PlayerProvider } from "~/components/player/provider";

export default function Layout({ children, params }: { children: React.ReactNode; params: { podcast: string } }) {
	const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	return (
		<MainLayout params={params}>
			<>
				<Script src={`https://platform.twitter.com/widgets.js?v=${id}`} />
				<PlayerProvider>{children}</PlayerProvider>
			</>
		</MainLayout>
	);
}
