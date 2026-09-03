import { expect, test } from "vitest";

import { toDateString } from "./format-date";

test("toDateString should return formatted date string for valid Date", () => {
  const date = new Date("2024-01-15");
  const result = toDateString(date);
  expect(result).toBe("1/15/2024");
});

test("toDateString should return undefined for null", () => {
  const result = toDateString(null);
  expect(result).toBeUndefined();
});

test("toDateString should return undefined for undefined", () => {
  const result = toDateString(undefined);
  expect(result).toBeUndefined();
});
