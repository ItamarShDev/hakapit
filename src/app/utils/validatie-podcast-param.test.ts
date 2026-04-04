import { expect, test } from "bun:test";
import { validatePodcastParam } from "./validatie-podcast-param";

test("validatePodcastParam should return true for valid podcast names", () => {
	expect(validatePodcastParam("hakapit")).toBe(true);
	expect(validatePodcastParam("nitk")).toBe(true);
	expect(validatePodcastParam("balcony-albums")).toBe(true);
});

test("validatePodcastParam should return false for invalid podcast names", () => {
	expect(validatePodcastParam("invalid")).toBe(false);
	expect(validatePodcastParam("hakapit-extra")).toBe(false);
	expect(validatePodcastParam("")).toBe(false);
	expect(validatePodcastParam("random-podcast")).toBe(false);
});

test("validatePodcastParam should provide type narrowing", () => {
	const podcast = "hakapit" as string;
	if (validatePodcastParam(podcast)) {
		// At this point, TypeScript should know podcast is of type PodcastName
		expect(["hakapit", "nitk", "balcony-albums"]).toContain(podcast);
	}
});
