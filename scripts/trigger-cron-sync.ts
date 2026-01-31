import { ConvexHttpClient } from "convex/browser";
import { internal } from "../convex/_generated/api";

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
	console.error("CONVEX_URL not set");
	process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function triggerSync() {
	console.log("🚀 Manually triggering cron sync...\n");
	
	try {
		// Note: We can't directly call internal actions from the client
		// But we can check if the cron will run by expiring the cache
		console.log("⚠️ Cannot directly trigger internal action from client.");
		console.log("The cron job should run automatically within 5 minutes.");
		console.log("\nTo force sync immediately, you need to:");
		console.log("1. Go to Convex dashboard");
		console.log("2. Navigate to the 'Crons' tab");
		console.log("3. Manually trigger 'refresh-latest-episode-5m'");
		console.log("\nOr wait for the next scheduled run (every 5 minutes).");
		
	} catch (error) {
		console.error("\n❌ Error:", error);
		process.exit(1);
	}
}

triggerSync();
