import type { Feed } from "./types";

export function sliceFeedItems(feed: Feed, number: number): Feed {
	if (number <= 0) {
		return feed;
	}
	return { ...feed, items: feed.items.slice(0, number) };
}
