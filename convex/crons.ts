import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron("refresh-soccer-snapshot-15m", "*/15 * * * *", internal.football.refreshSnapshot);

crons.cron("refresh-latest-episode-hourly", "0 * * * *", internal.podcasts.refreshLatestEpisodeCache, {
  podcastName: "hakapit",
});

export default crons;
