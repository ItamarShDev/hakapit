import { expect, test } from "bun:test";
import { getDirectionFromText } from "./text-direction";

test("getDirectionFromText should return rtl for Hebrew text", () => {
	const result = getDirectionFromText("שלום עולם");
	expect(result).toBe("rtl");
});

test("getDirectionFromText should return rtl for Arabic text", () => {
	const result = getDirectionFromText("مرحبا بالعالم");
	expect(result).toBe("rtl");
});

test("getDirectionFromText should return ltr for English text", () => {
	const result = getDirectionFromText("Hello World");
	expect(result).toBe("ltr");
});

test("getDirectionFromText should return rtl for empty string", () => {
	const result = getDirectionFromText("");
	expect(result).toBe("rtl");
});

test("getDirectionFromText should return ltr for mixed LTR content", () => {
	const result = getDirectionFromText("Hello123");
	expect(result).toBe("ltr");
});

test("getDirectionFromText should return rtl for Hebrew with numbers", () => {
	const result = getDirectionFromText("שלום 123");
	expect(result).toBe("rtl");
});

test("getDirectionFromText should return ltr for Latin script", () => {
	const result = getDirectionFromText("Bonjour le monde");
	expect(result).toBe("ltr");
});
