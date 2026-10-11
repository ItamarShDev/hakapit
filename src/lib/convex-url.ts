export type ConvexUrlMissingMode = "throw" | "warn" | "silent";

type RuntimeEnvironment = {
  env?: Record<string, string | undefined>;
};

const metaEnv =
  typeof import.meta === "undefined" ? undefined : (import.meta.env as Record<string, string | undefined> | undefined);
const runtimeEnv =
  typeof globalThis !== "undefined" && "process" in globalThis
    ? (globalThis as typeof globalThis & { process?: RuntimeEnvironment }).process?.env
    : undefined;

export function resolveConvexUrl(onMissing: ConvexUrlMissingMode = "throw"): string | null {
  const convexUrl = runtimeEnv?.CONVEX_URL ?? metaEnv?.CONVEX_URL ?? metaEnv?.VITE_CONVEX_URL;

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

let convexAvailable: boolean | undefined;

export function isConvexAvailable(): boolean {
  if (convexAvailable !== undefined) return convexAvailable;
  convexAvailable = resolveConvexUrl("silent") !== null;
  return convexAvailable;
}
