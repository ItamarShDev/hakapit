import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
	console.error("CONVEX_URL not set");
	process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function checkLatestEpisode() {
	console.log("🔍 Checking latest episode...\n");
	
	try {
		// Get latest episode
		const latest = await client.query(api.podcasts.getLatestEpisode, {
			podcastName: "hakapit",
		});
		
		if (latest) {
			console.log(`📺 Latest Episode in DB:`);
			console.log(`   Episode #${latest.episodeNumber}`);
			console.log(`   Title: ${latest.title}`);
			console.log(`   Published: ${latest.publishedAt ? new Date(latest.publishedAt).toLocaleDateString() : 'N/A'}`);
		} else {
			console.log("❌ No latest episode found!");
		}
		
		// Check cache status
		const rssCache = await client.query(api.cache.getCacheTracking, {
			dataType: "podcast-rss-hakapit",
		});
		
		const episodeCache = await client.query(api.cache.getCacheTracking, {
			dataType: "latest-episode-hakapit",
		});
		
		console.log(`\n📦 RSS Cache:`);
		if (rssCache) {
			const expired = rssCache.expiresAt ? rssCache.expiresAt < Date.now() : true;
			console.log(`   Status: ${expired ? '❌ EXPIRED' : '✅ FRESH'}`);
			console.log(`   Last Updated: ${new Date(rssCache.lastUpdated).toLocaleString()}`);
			console.log(`   Expires: ${rssCache.expiresAt ? new Date(rssCache.expiresAt).toLocaleString() : 'N/A'}`);
		} else {
			console.log(`   ❌ Not found`);
		}
		
		console.log(`\n📦 Episode Cache:`);
		if (episodeCache) {
			const expired = episodeCache.expiresAt ? episodeCache.expiresAt < Date.now() : true;
			console.log(`   Status: ${expired ? '❌ EXPIRED' : '✅ FRESH'}`);
			console.log(`   Last Updated: ${new Date(episodeCache.lastUpdated).toLocaleString()}`);
			console.log(`   Expires: ${episodeCache.expiresAt ? new Date(episodeCache.expiresAt).toLocaleString() : 'N/A'}`);
			if (episodeCache.payload) {
				try {
					const cached = JSON.parse(episodeCache.payload);
					console.log(`   Cached Episode: #${cached.episodeNumber} - ${cached.title}`);
				} catch (e) {
					console.log(`   ⚠️ Failed to parse cached payload`);
				}
			}
		} else {
			console.log(`   ❌ Not found`);
		}
		
	} catch (error) {
		console.error("\n❌ Error:", error);
		process.exit(1);
	}
}

checkLatestEpisode();
