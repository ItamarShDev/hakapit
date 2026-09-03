import { api } from "convex/_generated/api";

import { useConvexQuery } from "~/integrations/convex/use-convex-query";

export function useAllTransfers() {
  return useConvexQuery(api.football.getAllTransfers);
}
