import { expect, test } from "bun:test";

import { shouldPrioritizeEpisodeImage } from "./feed";

test("eagerly loads only the first feed image before visibility is measured", () => {
  expect([0, 1, 2, 3].map(shouldPrioritizeEpisodeImage)).toEqual([true, false, false, false]);
});
