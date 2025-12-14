import { expect, test } from "bun:test";
import { isTransferBuy } from "./utils";

test("isTransferBuy should return false for non-buy transfer types", () => {
	expect(isTransferBuy("Loan")).toBe(false);
	expect(isTransferBuy("Free Transfer")).toBe(false);
	expect(isTransferBuy("Back from Loan")).toBe(false);
	expect(isTransferBuy(null)).toBe(false);
	expect(isTransferBuy("N/A")).toBe(false);
	expect(isTransferBuy(undefined)).toBe(false);
});

test("isTransferBuy should return true for buy transfer types", () => {
	expect(isTransferBuy("€75m")).toBe(true);
	expect(isTransferBuy("some other string")).toBe(true);
});
