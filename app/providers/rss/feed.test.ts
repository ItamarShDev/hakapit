import { expect, test } from "bun:test";
import { sliceFeedItems } from "./feed.utils";
import type { Feed } from "./types";

const mockFeed: Feed = {
	items: [
		{
			title: "Episode 1",
			number: 1,
			enclosure: { url: "" },
			guid: "",
			link: "",
			content: "",
			pubDate: "",
			duration: "",
			imageUrl: "",
			audioUrl: "",
			isoDate: "",
			itunes: {
				image: "",
				duration: "",
			},
		},
		{
			title: "Episode 2",
			number: 2,
			enclosure: { url: "" },
			guid: "",
			link: "",
			content: "",
			pubDate: "",
			duration: "",
			imageUrl: "",
			audioUrl: "",
			isoDate: "",
			itunes: {
				image: "",
				duration: "",
			},
		},
		{
			title: "Episode 3",
			number: 3,
			enclosure: { url: "" },
			guid: "",
			link: "",
			content: "",
			pubDate: "",
			duration: "",
			imageUrl: "",
			audioUrl: "",
			isoDate: "",
			itunes: {
				image: "",
				duration: "",
			},
		},
	],
	title: "Test Feed",
	description: "A mock feed for testing",
	image: { url: "" },
	link: "",
	itunes: {
		image: undefined,
		owner: undefined,
		author: undefined,
		summary: undefined,
		explicit: undefined,
		categories: undefined,
		keywords: undefined,
	},
};

test("sliceFeedItems should slice the items correctly when number is positive", () => {
	const result = sliceFeedItems(mockFeed, 2);
	expect(result.items.length).toBe(2);
	expect(result.items[0].title).toBe("Episode 1");
	expect(result.items[1].title).toBe("Episode 2");
});

test("sliceFeedItems should return the original feed when number is zero", () => {
	const result = sliceFeedItems(mockFeed, 0);
	expect(result.items.length).toBe(3);
});

test("sliceFeedItems should return the original feed when number is negative", () => {
	const result = sliceFeedItems(mockFeed, -1);
	expect(result.items.length).toBe(3);
});

test("sliceFeedItems should handle slicing more items than available", () => {
	const result = sliceFeedItems(mockFeed, 5);
	expect(result.items.length).toBe(3);
});

test("sliceFeedItems should handle an empty feed", () => {
	const emptyFeed: Feed = { ...mockFeed, items: [] };
	const result = sliceFeedItems(emptyFeed, 2);
	expect(result.items.length).toBe(0);
});
