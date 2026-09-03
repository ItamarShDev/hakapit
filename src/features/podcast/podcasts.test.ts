import { expect, test } from "bun:test";

import { isPodcastName } from "./podcasts";

test("isPodcastName should return true for valid podcast names", () => {
  expect(isPodcastName("hakapit")).toBe(true);
  expect(isPodcastName("nitk")).toBe(true);
  expect(isPodcastName("balcony-albums")).toBe(true);
});

test("isPodcastName should return false for invalid podcast names", () => {
  expect(isPodcastName("invalid")).toBe(false);
  expect(isPodcastName("hakapit-extra")).toBe(false);
  expect(isPodcastName("")).toBe(false);
  expect(isPodcastName("random-podcast")).toBe(false);
});

test("isPodcastName should provide type narrowing", () => {
  const podcast = "hakapit" as string;
  if (isPodcastName(podcast)) {
    expect(["hakapit", "nitk", "balcony-albums"]).toContain(podcast);
  }
});
