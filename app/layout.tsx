import { AnalyticsWrapper } from "~/components/analytics";
import "./globals.css";
import { NavigationProgress } from "./components/navigation-progress";
import "./styles.css";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="he">
			<body>
				<NavigationProgress />
				{children}
				<AnalyticsWrapper />
			</body>
		</html>
	);
}
