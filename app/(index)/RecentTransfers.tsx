import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getTransferData } from "~/providers/football-api";
import { isTransferBuy } from "~/providers/football-api/utils";

function TransferView({ transfer }: { transfer: Awaited<ReturnType<typeof getTransferData>>[number] }) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Avatar>
						<AvatarImage src={transfer.playerPhoto ?? undefined} />
					</Avatar>
				</TooltipTrigger>
				<TooltipContent
					side="bottom"
					className="rounded-xl bg-primary border-accent flex flex-col gap-2 items-center justify-between direction-rtl"
				>
					<div className="text-md ">{transfer.playerName}</div>
					<div className="text-xs text-slate-400">
						{transfer.date ? new Date(transfer.date).toLocaleDateString() : ""}
					</div>
					<div className="text-xs text-slate-400">{transfer.teamName}</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export async function RecentTransfers() {
	const transfers = await getTransferData();
	if (!transfers) return null;

	// sort by date descending (most recent first)
	const sortedTransfers = transfers
		.filter((transfer) => isTransferBuy(transfer.type))
		.slice()
		.sort((a, b) => {
			const dateA = a.date ? new Date(a.date).getTime() : 0;
			const dateB = b.date ? new Date(b.date).getTime() : 0;
			return dateB - dateA;
		});

	const transferViews = sortedTransfers.map((transfer) => (
		<li key={transfer.playerId}>
			<TransferView transfer={transfer} />
		</li>
	));
	return (
		<div className="flex flex-col gap-2 items-center">
			<h2>העברות אחרונות</h2>
			<ul className="flex flex-row gap-2 list-none">{transferViews}</ul>
		</div>
	);
}
