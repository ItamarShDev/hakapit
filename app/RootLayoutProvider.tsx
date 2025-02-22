"use client";
import type React from "react";
import { createContext, useContext, useEffect } from "react";

// Create a context
const RootLayoutContext = createContext(null);

// Create a provider component
export const RootLayoutProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			window.addEventListener("load", () => {
				navigator.serviceWorker
					.register("/public/sw.js")
					.then((registration) => {
						console.log("Service Worker registered with scope:", registration.scope);
					})
					.catch((error) => {
						console.error("Service Worker registration failed:", error);
					});
			});
		}
	}, []);

	return <RootLayoutContext.Provider value={null}>{children}</RootLayoutContext.Provider>;
};

// Custom hook to use the RootLayout context
export const useRootLayout = () => {
	return useContext(RootLayoutContext);
};
