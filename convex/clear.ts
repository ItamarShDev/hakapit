import { mutation, query } from "./_generated/server";

// Clear all episodes from the database
export const clearAllEpisodes = mutation({
	handler: async (ctx) => {
		const episodes = await ctx.db.query("episodes").collect();

		let deletedCount = 0;
		for (const episode of episodes) {
			await ctx.db.delete(episode._id);
			deletedCount++;
		}

		return {
			message: `Successfully deleted ${deletedCount} episodes`,
			deletedCount,
		};
	},
});

// Check how many episodes exist
export const getEpisodeCount = query({
	handler: async (ctx) => {
		const episodes = await ctx.db.query("episodes").collect();
		return episodes.length;
	},
});
