import { expect, test } from "bun:test";

import { shouldPrioritizeEpisodeImage } from "./feed";

test("prioritizes only the first two feed episode images", () => {
  expect([0, 1, 2, 3].map(shouldPrioritizeEpisodeImage)).toEqual([true, true, false, false]);
});
