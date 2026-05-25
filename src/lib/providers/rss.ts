import Parser from 'rss-parser';
import { removeIframes } from '$lib/utils';
import type { EpisodeData, Feed } from '$lib/types/podcast';
import { env } from '$env/dynamic/private';

function getPodcastUrls(): Record<string, string | undefined> {
	return {
		hakapit: env.HAKAPIT_RSS,
		nitk: env.NITK_RSS,
		'balcony-albums': env.BALCONY_RSS
	};
}

export async function fetchRss(url: string | undefined): Promise<Feed> {
	if (!url) {
		return { items: [], title: '', itunes: {} };
	}

	const parser = new Parser();
	try {
		const rss = await parser.parseURL(url);
		const items = rss.items
			.filter((item) => !item.title?.includes('מתוך פרק'))
			.filter((item) => item.title?.includes('פרק'))
			.map((item) => ({
				...item,
				episodeGUID: item.guid?.split('/').pop(),
				number:
					Number(item.title?.match(/פרק (\d+)/)?.[1]) ||
					Number(item.title?.match(/פרק - (\d+)/)?.[1]),
				content: removeIframes(item.content || ''),
				contentSnippet: removeIframes(item.contentSnippet || '')
			})) as EpisodeData[];
		return { ...rss, items } as Feed;
	} catch (error) {
		console.warn('Failed to fetch RSS feed:', error);
		return { items: [], title: '', itunes: {} };
	}
}

export function sliceFeedItems(feed: Feed, number: number): Feed {
	if (number <= 0) {
		return feed;
	}
	return { ...feed, items: feed.items.slice(0, number) };
}

export async function fetchPodcastRss(podcast: string, limit = 5): Promise<Feed> {
	const urls = getPodcastUrls();
	const url = urls[podcast];
	const rss = await fetchRss(url);
	return sliceFeedItems(rss, limit);
}
