"use client";

import Script from "next/script";

export function TwitterLoader() {
	// Use a deterministic ID for server-side rendering to avoid crypto/random issues
	// Add timestamp for cache busting when client-side
	const id = typeof window !== "undefined" ? Date.now().toString(36) : "twitter-widgets";
	return <Script src={`https://platform.twitter.com/widgets.js?v=${id}`} />;
}
