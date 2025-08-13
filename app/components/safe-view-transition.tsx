"use client";
import type React from "react";
import { unstable_ViewTransition as ViewTransition } from "react";

export function SafeViewTransition({ children, name = "page" }: { children: React.ReactNode; name?: string }) {
	// Suppress hydration mismatches caused by client-only inline styles
	return (
		<div suppressHydrationWarning>
			<ViewTransition name={name}>{children}</ViewTransition>
		</div>
	);
}
