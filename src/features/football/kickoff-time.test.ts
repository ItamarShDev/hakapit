import { expect, test } from "bun:test";

import { formatMatchKickoff } from "./kickoff-time";

test("formats the derby in Israel winter time", () => {
  const kickoff = formatMatchKickoff("2026-11-29T12:00:00Z");
  expect(kickoff).toContain("29.11.2026");
  expect(kickoff).toContain("14:00");
});

test("accounts for Israel daylight saving time", () => {
  const kickoff = formatMatchKickoff("2026-07-01T12:00:00Z");
  expect(kickoff).toContain("1.7.2026");
  expect(kickoff).toContain("15:00");
});

test("uses the local date after midnight", () => {
  const kickoff = formatMatchKickoff("2026-07-01T21:30:00Z");
  expect(kickoff).toContain("2.7.2026");
  expect(kickoff).toContain("00:30");
});

test("does not display an invalid kickoff", () => {
  expect(formatMatchKickoff("invalid")).toBeNull();
});
