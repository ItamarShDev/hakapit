import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/remix";

export function AnalyticsWrapper() {
	return (
		<>
			<Analytics />
			<SpeedInsights />
		</>
	);
}
