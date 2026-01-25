import { ConvexHttpClient } from "convex/browser";

const metaEnv =
	typeof import.meta === "undefined" ? undefined : (import.meta.env as Record<string, string | undefined> | undefined);

export type ConvexUrlMissingMode = "throw" | "warn" | "silent";

/**
 * Resolve Convex URL from process/env and Vite meta env. Returns null when missing (unless throw mode).
 * Use `warn` to log once per invocation in environments where Convex is optional (e.g., CI/e2e).
 */
export function resolveConvexUrl(onMissing: ConvexUrlMissingMode = "throw"): string | null {
	const convexUrl = process.env.CONVEX_URL ?? metaEnv?.CONVEX_URL ?? metaEnv?.VITE_CONVEX_URL;

	if (!convexUrl) {
		switch (onMissing) {
			case "throw":
				throw new Error("CONVEX_URL environment variable is required");
			case "warn":
				console.warn("Convex URL missing; Convex-backed features will be disabled (likely in CI/e2e)");
				break;
			case "silent":
			default:
				break;
		}
	}

	return convexUrl ?? null;
}

let convexClientSingleton: ConvexHttpClient | null | undefined;
let convexAvailable: boolean | undefined;

/**
 * Get a shared Convex HTTP client. Respects resolveConvexUrl missing behavior per mode.
 * Returns null when URL is absent (unless throw mode).
 */
export function getConvexClient(onMissing: "throw"): ConvexHttpClient;
export function getConvexClient(onMissing?: Exclude<ConvexUrlMissingMode, "throw">): ConvexHttpClient | null;
export function getConvexClient(onMissing: ConvexUrlMissingMode = "throw"): ConvexHttpClient | null {
	if (convexClientSingleton !== undefined) {
		return convexClientSingleton;
	}

	const url = resolveConvexUrl(onMissing);
	if (!url) {
		return null;
	}

	convexClientSingleton = new ConvexHttpClient(url);
	return convexClientSingleton;
}

/**
 * Whether Convex is configured (URL present). Uses silent mode to avoid noisy logs in optional envs (e.g., CI/e2e).
 */
export function isConvexAvailable(): boolean {
	if (convexAvailable !== undefined) return convexAvailable;
	convexAvailable = resolveConvexUrl("silent") !== null;
	return convexAvailable;
}
