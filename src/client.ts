import { inject as injectAnalytics } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";
import { run } from "remix/component";

import { Application } from "~/app";
import { createNavigationResolver, enableNavigationFallback } from "~/navigation";
import "~/styles.css";
export { Application };
const app = run({
  resolveFrame: createNavigationResolver(() => app.frames.top),
  loadModule: async (_url, exportName) => {
    if (exportName === "Application") return Application;
    throw new Error("Unknown client entry: " + exportName);
  },
});
enableNavigationFallback(app);
app.addEventListener("error", (event) => console.error("Remix component error", event));
if (import.meta.env.PROD) {
  injectAnalytics();
  injectSpeedInsights();
}
