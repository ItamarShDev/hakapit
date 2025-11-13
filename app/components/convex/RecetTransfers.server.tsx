import { preloadQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";
import { RecentTransfers } from "./RecentTransfers";

export async function RecentTransfersServer() {
	const transfers = await preloadQuery(api.football.getAllTransfers);
	return <RecentTransfers transfers={transfers} />;
}
