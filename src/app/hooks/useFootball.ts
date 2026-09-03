import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { isConvexAvailable } from "~/app/providers/convex/env";

export function useAllTransfers() {
  if (!isConvexAvailable()) return undefined;
  return useQuery(api.football.getAllTransfers);
}
