import { api } from "convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;
const podcastNames = ["hakapit", "nitk", "balcony-albums"] as const;
type PodcastName = (typeof podcastNames)[number];
const requestedPodcastName = process.argv[2];
const podcastName =
  requestedPodcastName === undefined
    ? "hakapit"
    : (podcastNames as readonly string[]).includes(requestedPodcastName)
      ? (requestedPodcastName as PodcastName)
      : null;

if (!podcastName) {
  throw new Error(`Unknown podcast: ${requestedPodcastName}`);
}

if (!CONVEX_URL) {
  console.error("CONVEX_URL not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const sync = await client.action(api.podcasts.ensureFeedFresh, { podcastName });
const latest = await client.query(api.podcasts.getLatestEpisode, { podcastName });

console.log(`Synced ${podcastName}: ${sync.synced}`);
console.log(latest ? `Latest: #${latest.episodeNumber} - ${latest.title}` : "No episodes found");
