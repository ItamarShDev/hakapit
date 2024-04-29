import { MainLayout } from "~/layouts/main";
import "./globals.css";

export default function RootLayout({
	children,
	params: { podcast },
}: {
	children: React.ReactNode;
	params: { podcast: string };
}) {
	return <MainLayout params={{ podcast }}>{children}</MainLayout>;
}
