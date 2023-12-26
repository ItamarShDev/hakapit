import type Parser from "rss-parser";

export type EpisodeData = {
	guid: string;
	title: string;
	link: string;
	content: string;
	pubDate: string;
	duration: string;
	imageUrl: string;
	audioUrl: string;
	isoDate: string;
	itunes: { image: string; duration: string };
	enclosure: { url: string };
	episodeGUID?: number;
	contentSnippet?: string;
	number?: number;
};
export type Feed = {
	items: EpisodeData[];
	image?: { link?: string; url: string; title?: string };
	paginationLinks?: Parser.PaginationLinks;
	link?: string;
	title?: string;
	feedUrl?: string;
	description?: string;
	itunes: {
		image?: string;
		owner?: { name?: string; email?: string };
		author?: string;
		summary?: string;
		explicit?: string;
		categories?: string[];
		keywords?: string[];
	};
};
