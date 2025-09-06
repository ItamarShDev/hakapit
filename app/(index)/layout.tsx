import { PlayerProvider } from "~/components/player/provider";
import { MainLayout } from "~/layouts/main";

export default function RootLayout(props: { children: React.ReactNode }) {
    const { children } = props;

    return (
        <MainLayout params={{ podcast: "hakapit" }}>
            <PlayerProvider>{children}</PlayerProvider>
        </MainLayout>
    );
}
