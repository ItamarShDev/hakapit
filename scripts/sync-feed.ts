import { api } from "convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;
const podcastName = process.argv[2] ?? "hakapit";

if (!CONVEX_URL) {
  console.error("CONVEX_URL not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const sync = await client.action(api.podcasts.ensureFeedFresh, { podcastName, force: true });
const latest = await client.query(api.podcasts.getLatestEpisode, { podcastName });

console.log(`Synced ${podcastName}: ${sync.synced}`);
console.log(latest ? `Latest: #${latest.episodeNumber} - ${latest.title}` : "No episodes found");
