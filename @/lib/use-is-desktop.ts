"use client";

import { useEffect, useState } from "react";

/**
 * useIsDesktop
 * Detects if the viewport matches a desktop breakpoint using a media query.
 * Defaults to (min-width: 768px) which is Tailwind's md breakpoint.
 */
export function useIsDesktop(query = "(min-width: 768px)") {
	const [isDesktop, setIsDesktop] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined" || !("matchMedia" in window)) return;

		const mql = window.matchMedia(query);
		const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
			// MediaQueryListEvent for modern browsers; initial call passes MediaQueryList
			const matches = "matches" in e ? e.matches : (e as MediaQueryList).matches;
			setIsDesktop(matches);
		};

		// Set initial value
		onChange(mql);

		// Subscribe to changes (support older Safari)
		if (typeof mql.addEventListener === "function") {
			mql.addEventListener("change", onChange as (ev: Event) => void);
			return () => mql.removeEventListener("change", onChange as (ev: Event) => void);
		}
		mql.addEventListener("change", onChange as (ev: Event) => void);
		return () => {
			mql.removeEventListener("change", onChange as (ev: Event) => void);
		};
	}, [query]);

	return isDesktop;
}
