import { AnalyticsWrapper } from "~/components/analytics";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
			<AnalyticsWrapper />
		</html>
	);
}
