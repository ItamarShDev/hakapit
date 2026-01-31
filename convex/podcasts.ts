import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { internalAction, mutation, query } from "./_generated/server";

// RSS Feed parsing types
interface RSSItem {
	title?: string;
	guid?: string;
	link?: string;
	content?: string;
	contentSnippet?: string;
	isoDate?: string;
	itunes?: {
		image?: string;
		duration?: string;
	};
	enclosure?: {
		url?: string;
	};
}

interface RSSFeed {
	title?: string;
	link?: string;
	description?: string;
	feedUrl?: string;
	itunes?: {
		image?: string;
		owner?: {
			name?: string;
			email?: string;
		};
		summary?: string;
	};
	items: RSSItem[];
}

const PODCAST_RSS_URLS: Record<string, string | undefined> = {
	hakapit: process.env.HAKAPIT_RSS,
	nitk: process.env.NITK_RSS,
	"balcony-albums": process.env.BALCONY_RSS,
};

// Get podcast by name
export const getPodcastByName = query({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.name))
			.first();
	},
});

// Fetch RSS feed and parse it (server-side)
async function fetchAndParseRSS(url: string): Promise<RSSFeed | null> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.error(`RSS fetch failed: ${response.status}`);
			return null;
		}
		const xmlText = await response.text();
		
		// Simple XML parsing for RSS feeds
		const parseRSSXML = (xml: string): RSSFeed => {
			const removeIframes = (content: string) => content?.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "") || "";
			const getTextContent = (xml: string, tag: string): string | undefined => {
				const match = xml.match(new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, "i"));
				return match?.[1]?.trim();
			};
			
			const channel = xml.match(/<channel[^>]*>([\s\S]*?)<\/channel>/i)?.[1] || "";
			
			const feed: RSSFeed = {
				title: getTextContent(channel, "title"),
				link: getTextContent(channel, "link"),
				description: getTextContent(channel, "description"),
				feedUrl: url,
				itunes: {
					image: getTextContent(channel, "itunes:image")?.match(/href="([^"]+)"/)?.[1],
					owner: {
						name: getTextContent(channel, "itunes:name"),
						email: getTextContent(channel, "itunes:email"),
					},
					summary: getTextContent(channel, "itunes:summary"),
				},
				items: [],
			};
			
			const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);
			for (const itemMatch of itemMatches) {
				const itemXml = itemMatch[1];
				const title = getTextContent(itemXml, "title");
				
				// Filter: only include items with "פרק" and not "מתוך פרק"
				if (!title?.includes("פרק") || title?.includes("מתוך פרק")) {
					continue;
				}
				
				const guid = getTextContent(itemXml, "guid");
				const content = removeIframes(getTextContent(itemXml, "content:encoded") || getTextContent(itemXml, "description") || "");
				const enclosureUrl = itemXml.match(/<enclosure[^>]*url="([^"]+)"/)?.[1];
				
				feed.items.push({
					title,
					guid,
					link: getTextContent(itemXml, "link"),
					content,
					contentSnippet: removeIframes(getTextContent(itemXml, "description") || ""),
					isoDate: getTextContent(itemXml, "pubDate"),
					itunes: {
						image: getTextContent(itemXml, "itunes:image")?.match(/href="([^"]+)"/)?.[1],
						duration: getTextContent(itemXml, "itunes:duration"),
					},
					enclosure: enclosureUrl ? { url: enclosureUrl } : undefined,
				});
			}
			
			return feed;
		};
		
		return parseRSSXML(xmlText);
	} catch (error) {
		console.error("Failed to fetch RSS:", error);
		return null;
	}
}

// Extract episode number from title
function extractEpisodeNumber(title: string): number {
	const match = title.match(/פרק (\d+)/) || title.match(/פרק - (\d+)/);
	return match ? Number(match[1]) : 0;
}

// Update feed from RSS (internal action callable from cron)
export const updateFeedFromRSS = internalAction({
	args: { podcastName: v.string() },
	handler: async (ctx, args) => {
		const rssUrl = PODCAST_RSS_URLS[args.podcastName];
		if (!rssUrl) {
			console.error(`No RSS URL configured for podcast: ${args.podcastName}`);
			return null;
		}
		
		const feed = await fetchAndParseRSS(rssUrl);
		if (!feed?.title) {
			console.error(`Failed to fetch RSS for: ${args.podcastName}`);
			return null;
		}
		
		// Upsert podcast
		await ctx.runMutation(api.podcasts.upsertPodcast, {
			name: args.podcastName,
			title: feed.title,
			link: feed.link,
			feedUrl: feed.feedUrl,
			description: feed.description,
			imageUrl: feed.itunes?.image,
			authorName: feed.itunes?.owner?.name,
			authorEmail: feed.itunes?.owner?.email,
			authorSummary: feed.itunes?.summary,
			authorImageUrl: feed.itunes?.image,
		});
		
		// Get existing episodes
		const existingEpisodes = await ctx.runQuery(api.podcasts.getPodcastWithEpisodes, {
			name: args.podcastName,
		});
		
		// Build a set of existing episode numbers for quick lookup
		const existingNumbers = new Set(
			existingEpisodes?.episodes?.map((e) => e.episodeNumber) || []
		);
		
		console.log(`Found ${feed.items.length} episodes in RSS feed for ${args.podcastName}`);
		console.log(`Existing episodes in DB: ${existingNumbers.size}`);
		
		// Process all episodes from the feed
		let episodesAdded = 0;
		let episodesUpdated = 0;
		
		for (const item of feed.items) {
			const episodeNumber = extractEpisodeNumber(item.title || "");
			if (episodeNumber === 0) {
				console.warn(`Skipping episode with invalid number: ${item.title}`);
				continue;
			}
			
			console.log(`Processing episode ${episodeNumber}: ${item.title}`);
			
			// Insert or update episode (createEpisode already handles upsert)
			await ctx.runMutation(api.podcasts.createEpisode, {
				podcastName: args.podcastName,
				episodeNumber,
				guid: item.guid?.split("/").pop(),
				title: item.title || "",
				link: item.link,
				description: item.contentSnippet,
				htmlDescription: item.content,
				imageUrl: item.itunes?.image,
				audioUrl: item.enclosure?.url || "",
				publishedAt: item.isoDate ? new Date(item.isoDate).getTime() : undefined,
				duration: item.itunes?.duration,
			});
			
			if (existingNumbers.has(episodeNumber)) {
				episodesUpdated++;
			} else {
				episodesAdded++;
			}
		}
		
		// Log the highest episode number we just synced
		const allNumbers = feed.items.map(item => extractEpisodeNumber(item.title || "")).filter(n => n > 0);
		const highestSynced = allNumbers.length > 0 ? Math.max(...allNumbers) : 0;
		console.log(`RSS sync complete: ${episodesAdded} added, ${episodesUpdated} updated. Highest episode: ${highestSynced}`);
		return { episodesAdded, episodesUpdated, highestEpisode: highestSynced };
	},
});

// Refresh latest episode cache into cacheTracking (used by cron)
export const refreshLatestEpisodeCache = internalAction({
	args: { podcastName: v.string() },
	handler: async (ctx, args): Promise<Doc<"episodes"> | null> => {
		const rssCacheKey = `podcast-rss-${args.podcastName}`;
		
		// Check if RSS cache is expired
		const cacheStatus = await ctx.runQuery(api.cache.isCacheExpired, {
			dataType: rssCacheKey,
		});
		
		// If RSS cache expired, fetch from RSS and update DB
		if (cacheStatus.expired) {
			console.log(`RSS cache expired for ${args.podcastName}, fetching fresh data...`);
			const result = await ctx.runAction(internal.podcasts.updateFeedFromRSS, {
				podcastName: args.podcastName,
			});
			
				if (result) {
				console.log(`RSS sync: ${result.episodesAdded} added, ${result.episodesUpdated} updated, highest: ${result.highestEpisode} for ${args.podcastName}`);
			}
			
			// Update RSS cache timestamp
			await ctx.runMutation(api.cache.updateCacheTracking, {
				dataType: rssCacheKey,
				source: "rss",
				expiresAt: Date.now() + 5 * 60 * 1000,
			});
		}
		
		// Now get the latest episode (which should be fresh)
		const latest = await ctx.runQuery(api.podcasts.getLatestEpisode, {
			podcastName: args.podcastName,
		});
		
		if (!latest) {
			console.warn(`No latest episode found for ${args.podcastName}`);
			return null;
		}
		
		console.log(`Latest episode for ${args.podcastName}: #${latest.episodeNumber} - ${latest.title}`);
		
		// Update homepage cache with fresh episode data
		const payload = JSON.stringify(latest);
		const cacheKey = `latest-episode-${args.podcastName}`;
		const expiresAt = Date.now() + 5 * 60 * 1000;
		await ctx.runMutation(api.cache.updateCacheTracking, {
			dataType: cacheKey,
			source: "podcast-feed",
			payload,
			expiresAt,
		});
		
		return latest as Doc<"episodes">;
	},
});

// Get podcast with episodes
export const getPodcastWithEpisodes = query({
	args: {
		name: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const podcast = await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.name))
			.first();

		if (!podcast) return null;

		const totalEpisodes = await ctx.db
			.query("episodes")
			.withIndex("by_podcastId_and_number", (q) => q.eq("podcastId", podcast._id))
			.collect()
			.then((all) => all.length);

		const episodesQuery = ctx.db
			.query("episodes")
			.withIndex("by_podcastId_and_number", (q) => q.eq("podcastId", podcast._id))
			.order("desc");

		const episodes =
			args.limit && args.limit > 0 ? await episodesQuery.take(args.limit) : await episodesQuery.collect();

		return {
			...podcast,
			episodes: episodes.map((episode) => ({
				...episode,
				podcast,
			})),
			totalEpisodes,
		};
	},
});

// Get latest episode for a podcast
export const getLatestEpisode = query({
	args: { podcastName: v.string() },
	handler: async (ctx, args) => {
		const podcast = await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.podcastName))
			.first();
		if (!podcast) return null;

		// Get all episodes to debug
		const allEpisodes = await ctx.db
			.query("episodes")
			.withIndex("by_podcastId", (q) => q.eq("podcastId", podcast._id))
			.collect();
		
		if (allEpisodes.length > 0) {
			const numbers = allEpisodes.map(e => e.episodeNumber).sort((a, b) => b - a);
			console.log(`All episode numbers in DB: ${numbers.slice(0, 10).join(", ")}... (${allEpisodes.length} total)`);
		}

		const latestByNumber = await ctx.db
			.query("episodes")
			.withIndex("by_podcastId_and_number", (q) => q.eq("podcastId", podcast._id).gt("episodeNumber", 0))
			.order("desc")
			.first();

		if (latestByNumber) {
			console.log(`getLatestEpisode returning: #${latestByNumber.episodeNumber} - ${latestByNumber.title}`);
			return {
				...latestByNumber,
				podcast,
			};
		}

		if (allEpisodes.length === 0) return null;

		const latestByPublishedAt = allEpisodes.reduce((best, current) => {
			const bestPublishedAt = best.publishedAt ?? 0;
			const currentPublishedAt = current.publishedAt ?? 0;
			return currentPublishedAt > bestPublishedAt ? current : best;
		}, allEpisodes[0]);

		return {
			...latestByPublishedAt,
			podcast,
		};
	},
});

// Get episode by number
export const getEpisodeByNumber = query({
	args: {
		podcastName: v.string(),
		episodeNumber: v.number(),
	},
	handler: async (ctx, args) => {
		const podcast = await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.podcastName))
			.first();

		if (!podcast) return null;

		const episode = await ctx.db
			.query("episodes")
			.withIndex("by_podcastId_and_number", (q) =>
				q.eq("podcastId", podcast._id).eq("episodeNumber", args.episodeNumber),
			)
			.first();

		if (!episode) return null;
		return {
			...episode,
			podcast: {
				name: podcast.name,
			},
		};
	},
});

// Create or update podcast
export const upsertPodcast = mutation({
	args: {
		name: v.string(),
		title: v.string(),
		link: v.optional(v.string()),
		description: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
		feedUrl: v.optional(v.string()),
		authorName: v.optional(v.string()),
		authorEmail: v.optional(v.string()),
		authorSummary: v.optional(v.string()),
		authorImageUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		if (!args.title?.trim()) {
			throw new Error(`upsertPodcast: 'title' is required (name='${args.name}')`);
		}
		if (args.name.startsWith(".")) {
			throw new Error(`upsertPodcast: invalid podcast name '${args.name}'`);
		}

		const existing = await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.name))
			.first();

		const now = Date.now();
		const podcastData = {
			...args,
			updatedAt: now,
		};

		if (existing) {
			await ctx.db.patch(existing._id, podcastData);
			return existing._id;
		}
		return await ctx.db.insert("podcasts", {
			...podcastData,
			createdAt: now,
		});
	},
});

// Create episode
export const createEpisode = mutation({
	args: {
		podcastName: v.string(),
		episodeNumber: v.number(),
		guid: v.optional(v.string()),
		title: v.string(),
		link: v.optional(v.string()),
		description: v.optional(v.string()),
		htmlDescription: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
		audioUrl: v.string(),
		publishedAt: v.optional(v.number()),
		duration: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const podcast = await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.podcastName))
			.first();

		if (!podcast) {
			throw new Error(`Podcast not found: ${args.podcastName}`);
		}

		const now = Date.now();

		const existing = await ctx.db
			.query("episodes")
			.withIndex("by_podcastId_and_number", (q) =>
				q.eq("podcastId", podcast._id).eq("episodeNumber", args.episodeNumber),
			)
			.first();

		const episodeData = {
			episodeNumber: args.episodeNumber,
			guid: args.guid,
			title: args.title,
			link: args.link,
			description: args.description,
			htmlDescription: args.htmlDescription,
			imageUrl: args.imageUrl,
			audioUrl: args.audioUrl,
			publishedAt: args.publishedAt,
			duration: args.duration,
			podcastId: podcast._id,
			updatedAt: now,
		};

		if (existing) {
			await ctx.db.patch(existing._id, episodeData);
			return existing._id;
		}

		return await ctx.db.insert("episodes", {
			...episodeData,
			createdAt: now,
		});
	},
});

// Get all podcasts
export const getAllPodcasts = query({
	handler: async (ctx) => {
		return await ctx.db.query("podcasts").collect();
	},
});

// Check if podcast was updated recently
export const getPodcastUpdateStatus = query({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		const podcast = await ctx.db
			.query("podcasts")
			.withIndex("by_name", (q) => q.eq("name", args.name))
			.first();

		if (!podcast) return null;

		const oneHourAgo = Date.now() - 5 * 60 * 1000;
		return {
			wasUpdatedRecently: podcast.updatedAt > oneHourAgo,
			lastUpdate: podcast.updatedAt,
		};
	},
});

