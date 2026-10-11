import { ConvexHttpClient } from "convex/browser";

import { isConvexAvailable, resolveConvexUrl, type ConvexUrlMissingMode } from "~/lib/convex-url";

export { isConvexAvailable, resolveConvexUrl };
export type { ConvexUrlMissingMode };

let convexClientSingleton: ConvexHttpClient | null | undefined;
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
