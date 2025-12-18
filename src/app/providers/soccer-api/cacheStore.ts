import { api } from "convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.CONVEX_URL || import.meta.env.CONVEX_URL || import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
	throw new Error("CONVEX_URL environment variable is required");
}

const convex = new ConvexHttpClient(convexUrl);
const CACHE_SOURCE = "soccer-api";

export async function getCachedValue<T>(key: string): Promise<T | null> {
	try {
		const record = await convex.query(api.cache.getCacheTracking, { dataType: key });
		if (!record) {
			return null;
		}
		if (record.expiresAt && record.expiresAt <= Date.now()) {
			return null;
		}
		if (!record.payload) {
			return null;
		}
		return JSON.parse(record.payload) as T;
	} catch (error) {
		console.warn(`[soccer-cache] Failed to read ${key}:`, error);
		return null;
	}
}

export async function setCachedValue<T>(key: string, value: T, ttlMs: number) {
	if (value == null) {
		return;
	}
	try {
		await convex.mutation(api.cache.updateCacheTracking, {
			dataType: key,
			source: CACHE_SOURCE,
			payload: JSON.stringify(value),
			expiresAt: Date.now() + ttlMs,
		});
	} catch (error) {
		console.warn(`[soccer-cache] Failed to write ${key}:`, error);
	}
}
