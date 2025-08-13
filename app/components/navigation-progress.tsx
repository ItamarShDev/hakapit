"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export function NavigationProgress() {
	return <ProgressBar height="2px" color="#22c55e" options={{ showSpinner: false }} shallowRouting />;
}
