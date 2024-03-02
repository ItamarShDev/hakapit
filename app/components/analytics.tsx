import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/remix";

export function AnalyticsWrapper() {
	if (process.env.NODE_ENV === "development") return null;
	return (
		<>
			<Analytics />
			<SpeedInsights debug />
		</>
	);
}
