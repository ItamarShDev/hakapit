import { v } from "convex/values";
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

export const dedupeEpisodesByNumberPerPodcast = mutation({
	args: {
		dryRun: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const dryRun = args.dryRun ?? true;
		const episodes = await ctx.db.query("episodes").collect();
		type EpisodeDoc = (typeof episodes)[number];

		const groups = new Map<string, typeof episodes>();
		for (const episode of episodes) {
			const key = `${episode.podcastId}:${episode.episodeNumber}`;
			const existing = groups.get(key);
			if (existing) {
				existing.push(episode);
			} else {
				groups.set(key, [episode]);
			}
		}

		let duplicateGroups = 0;
		let episodesDeleted = 0;
		const sample: Array<{
			podcastId: string;
			episodeNumber: number;
			keptId: string;
			deletedIds: string[];
		}> = [];

		const score = (e: EpisodeDoc) => {
			const hasGuid = e.guid ? 1 : 0;
			const hasPublishedAt = e.publishedAt ? 1 : 0;
			const hasImageUrl = e.imageUrl ? 1 : 0;
			const hasDescription = e.description ? 1 : 0;
			const hasHtmlDescription = e.htmlDescription ? 1 : 0;
			const hasLink = e.link ? 1 : 0;
			const audioLen = typeof e.audioUrl === "string" ? e.audioUrl.length : 0;
			const updatedAt = typeof e.updatedAt === "number" ? e.updatedAt : 0;
			return (
				hasGuid * 10 +
				hasPublishedAt * 5 +
				hasImageUrl * 2 +
				hasDescription +
				hasHtmlDescription +
				hasLink +
				audioLen / 1000 +
				updatedAt / 1e13
			);
		};

		for (const [key, group] of groups) {
			if (group.length <= 1) continue;
			duplicateGroups++;

			const sorted = [...group].sort((a, b) => {
				const diff = score(b) - score(a);
				if (diff !== 0) return diff;
				return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
			});
			const keep = sorted[0];
			const toDelete = sorted.slice(1);

			if (!dryRun) {
				for (const ep of toDelete) {
					await ctx.db.delete(ep._id);
					episodesDeleted++;
				}
			}

			if (sample.length < 25) {
				const [podcastId, episodeNumberStr] = key.split(":");
				sample.push({
					podcastId,
					episodeNumber: Number(episodeNumberStr),
					keptId: String(keep._id),
					deletedIds: toDelete.map((e) => String(e._id)),
				});
			}
		}

		return {
			dryRun,
			duplicateGroups,
			episodesDeleted: dryRun ? 0 : episodesDeleted,
			sample,
		};
	},
});
