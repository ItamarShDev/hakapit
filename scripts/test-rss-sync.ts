const CONVEX_URL_TEST = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!CONVEX_URL_TEST) {
  console.error("CONVEX_URL not set");
  process.exit(1);
}

async function testRSSSync() {
  console.log("🚀 Testing RSS sync for hakapit podcast...\n");

  try {
    // Note: forceSyncPodcast action does not exist in the current API
    // This script is disabled until the action is implemented
    console.log("⚠️ forceSyncPodcast action not implemented yet.");
    console.log("Script disabled.");

    // const result = await client.action(api.podcasts.forceSyncPodcast, {
    // 	podcastName: "hakapit",
    // });

    // console.log("\n✅ Sync complete!");
    // console.log("📊 Results:", JSON.stringify(result, null, 2));

    // if (result.latestEpisode) {
    // 	console.log(`\n🎙️ Latest Episode: #${result.latestEpisode.number} - ${result.latestEpisode.title}`);
    // } else {
    // 	console.log("\n⚠️ No latest episode found!");
    // }
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

testRSSSync();
