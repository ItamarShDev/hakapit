import { useQuery } from "convex/react";

import { isConvexAvailable } from "~/server/convex-client";

import type { OptionalRestArgsOrSkip } from "convex/react";
import type { FunctionReference } from "convex/server";

const convexEnabled = isConvexAvailable();

export function useConvexQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: OptionalRestArgsOrSkip<Query>
): Query["_returnType"] | undefined {
  if (!convexEnabled) return undefined;
  return useQuery(query, ...args);
}
