import { AnalyticsWrapper } from "~/components/analytics";
import "./globals.css";
import "./styles.css";
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="he">
			<body>
				{children}
				<AnalyticsWrapper />
			</body>
		</html>
	);
}
