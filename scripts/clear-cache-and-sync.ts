import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("CONVEX_URL not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function clearCacheAndSync() {
  console.log("🧹 Clearing podcast caches...\n");

  try {
    // Clear RSS cache
    const rssResult = await client.mutation(api.cache.clearCache, {
      dataType: "podcast-rss-hakapit",
    });
    console.log(`RSS Cache: ${rssResult.cleared ? "✅ Cleared" : "⚠️ Not found"}`);

    // Clear episode cache
    const episodeResult = await client.mutation(api.cache.clearCache, {
      dataType: "latest-episode-hakapit",
    });
    console.log(`Episode Cache: ${episodeResult.cleared ? "✅ Cleared" : "⚠️ Not found"}`);

    console.log("\n⏳ Waiting 2 seconds...\n");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Now check the latest episode - this should trigger a fresh fetch
    console.log("📡 Fetching latest episode (should trigger RSS sync)...\n");
    const latest = await client.query(api.podcasts.getLatestEpisode, {
      podcastName: "hakapit",
    });

    if (latest) {
      console.log(`✅ Latest Episode:`);
      console.log(`   Episode #${latest.episodeNumber}`);
      console.log(`   Title: ${latest.title}`);
      console.log(
        `   Published: ${latest.publishedAt ? new Date(latest.publishedAt).toLocaleDateString() : "N/A"}`,
      );
    } else {
      console.log("❌ No latest episode found!");
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

clearCacheAndSync();
