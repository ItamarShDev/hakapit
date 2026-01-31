import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
	console.error("CONVEX_URL not set");
	process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function testRSSSync() {
	console.log("🚀 Testing RSS sync for hakapit podcast...\n");
	
	try {
		// Call the force sync action
		const result = await client.action(api.podcasts.forceSyncPodcast, {
			podcastName: "hakapit",
		});
		
		console.log("\n✅ Sync complete!");
		console.log("📊 Results:", JSON.stringify(result, null, 2));
		
		if (result.latestEpisode) {
			console.log(`\n🎙️ Latest Episode: #${result.latestEpisode.number} - ${result.latestEpisode.title}`);
		} else {
			console.log("\n⚠️ No latest episode found!");
		}
		
	} catch (error) {
		console.error("\n❌ Error:", error);
		process.exit(1);
	}
}

testRSSSync();
