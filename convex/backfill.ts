import { mutation } from "./_generated/server";

// Delete old episodes that don't have podcastId (keep only new ones)
export const deleteOldEpisodes = mutation({
	handler: async (ctx) => {
		const episodes = await ctx.db.query("episodes").collect();

		let deletedCount = 0;
		for (const episode of episodes) {
			// Delete episodes that don't have podcastId (old schema)
			if (!episode.podcastId) {
				await ctx.db.delete(episode._id);
				deletedCount++;
			}
		}

		return {
			message: `Successfully deleted ${deletedCount} old episodes without podcastId`,
			deletedCount,
		};
	},
});
