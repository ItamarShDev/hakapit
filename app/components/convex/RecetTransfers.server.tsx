import { preloadQuery } from "convex/nextjs";
import { RecentTransfers } from "~/(index)/RecentTransfers";
import { api } from "~/convex/_generated/api";

export async function RecentTransfersServer() {
	await preloadQuery(api.football.getAllTransfers);
	return <RecentTransfers />;
}
