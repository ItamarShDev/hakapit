import { ConvexHttpClient } from 'convex/browser';
import { env } from '$env/dynamic/private';

let convexClient: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient | null {
	if (convexClient) return convexClient;
	const url = env.CONVEX_URL;
	if (!url) {
		console.warn('CONVEX_URL not set; Convex features disabled');
		return null;
	}
	convexClient = new ConvexHttpClient(url);
	return convexClient;
}
