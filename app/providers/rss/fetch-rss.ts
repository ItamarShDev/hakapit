import Parser from "rss-parser";
import type { EpisodeData } from "~/providers/rss/types";
export async function fetch_rss(url: string | undefined) {
	if (!url) {
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
