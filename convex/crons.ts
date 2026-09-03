import { cronJobs } from "convex/server";

import { api, internal } from "./_generated/api";

const crons = cronJobs();

crons.cron("refresh-soccer-snapshot-15m", "*/15 * * * *", internal.football.refreshSnapshot);

for (const podcastName of ["hakapit", "nitk", "balcony-albums"]) {
  crons.cron(`refresh-feed-${podcastName}`, "0 * * * *", api.podcasts.ensureFeedFresh, { podcastName });
}

export default crons;
