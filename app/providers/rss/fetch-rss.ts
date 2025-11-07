import Parser from "rss-parser";
import type { EpisodeData } from "~/providers/rss/types";
export async function fetch_rss(url: string | undefined) {
	if (!url) {
		return { items: [] };
	}

	// Skip RSS fetching during build time to avoid prerender errors
	if (
		process.env.NEXT_PHASE === "phase-production-build" ||
		(process.env.NODE_ENV === "production" && !process.env.HAKAPIT_RSS)
	) {
		return { items: [] };
	}

	const parser: Parser = new Parser();
	try {
		const rss = await parser.parseURL(url as string);
		const items = rss.items
			.filter((item) => !item.title?.includes("מתוך פרק"))
			.filter((item) => item.title?.includes("פרק"))
			.map((item) => ({
				...item,
				episodeGUID: item.guid?.split("/").pop(),
				number: Number(item.title?.match(/פרק (\d+)/)?.[1]) || Number(item.title?.match(/פרק - (\d+)/)?.[1]),
			})) as EpisodeData[];
		return { ...rss, items };
	} catch (error) {
		console.warn("Failed to fetch RSS feed:", error);
		return { items: [] };
	}
}
