import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

// Schedule cache warmers for the soccer snapshot
const crons = cronJobs();

// Refresh snapshot every 15 minutes to keep next match fresh
crons.cron("refresh-soccer-snapshot-15m", "*/15 * * * *", internal.football.refreshSnapshot);

// Refresh latest episode cache every hour
crons.cron("refresh-latest-episode-hourly", "0 * * * *", internal.podcasts.refreshLatestEpisodeCache, {
	podcastName: "hakapit",
});

export default crons;
