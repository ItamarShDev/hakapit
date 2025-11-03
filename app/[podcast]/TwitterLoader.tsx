"use client";

import Script from "next/script";
import { PlayerProvider } from "~/components/player/provider";

export function TwitterLoader() {
	const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	return <Script src={`https://platform.twitter.com/widgets.js?v=${id}`} />;
}
