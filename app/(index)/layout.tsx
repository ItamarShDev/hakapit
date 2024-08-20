import { PlayerProvider } from "~/components/player/provider";
import { MainLayout } from "~/layouts/main";

export default function RootLayout({
	children,
	params: { podcast },
}: {
	children: React.ReactNode;
	params: { podcast: string };
}) {
	return (
		<MainLayout params={{ podcast }}>
			<PlayerProvider>{children}</PlayerProvider>
		</MainLayout>
	);
}
