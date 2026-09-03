const CONVEX_URL_TEST = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;

if (!CONVEX_URL_TEST) {
  console.error("CONVEX_URL not set");
  process.exit(1);
}

async function testRSSSync() {
  console.log("🚀 Testing RSS sync for hakapit podcast...\n");

  try {
    console.log("⚠️ forceSyncPodcast action not implemented yet.");
    console.log("Script disabled.");
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

testRSSSync();
