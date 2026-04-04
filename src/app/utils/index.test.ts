import { expect, test } from "bun:test";
import { toDate, toDateString } from "./index";

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

test("toDate should return Date object for valid ISO string", () => {
	const result = toDate("2024-01-15T10:30:00Z");
	expect(result).toBeInstanceOf(Date);
	expect(result?.toISOString()).toBe("2024-01-15T10:30:00.000Z");
});

test("toDate should return Date object for valid date string", () => {
	const result = toDate("2024-01-15");
	expect(result).toBeInstanceOf(Date);
	expect(result?.toISOString()).toContain("2024-01-15");
});

test("toDate should return null for empty string", () => {
	const result = toDate("");
	expect(result).toBeNull();
});

test("toDate should return null for undefined", () => {
	const result = toDate(undefined);
	expect(result).toBeNull();
});

test("toDate should return null for invalid date string", () => {
	const result = toDate("invalid-date");
	expect(result).toBeNull();
});
