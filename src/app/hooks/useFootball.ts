import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Hook to get all transfers (real-time streaming)
export function useAllTransfers() {
	return useQuery(api.football.getAllTransfers);
}
