import type { Doc } from "convex/_generated/dataModel";
import { useState } from "react";
import { Avatar, AvatarImage } from "~/@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "~/@/components/ui/popover";
import { useAllTransfers } from "~/app/hooks/useFootball";

function TransferView({
	transfer,
	isOpen,
	onOpenChange,
}: {
	transfer: Doc<"transfers">;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	if (!transfer) return null;

	const isInTransfer = transfer.direction === "IN";

	return (
		<Popover open={isOpen} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<div className="relative cursor-pointer">
					<Avatar>
						<AvatarImage src={transfer.playerPhoto ?? undefined} />
					</Avatar>
				</div>
			</PopoverTrigger>
			<PopoverContent side="bottom" className="w-80 p-0" align="center">
				<Card className="shadow-lg" dir="rtl">
					<CardHeader className="pb-3">
						<div className="flex items-center gap-4">
							<Avatar className="w-16 h-16">
								<AvatarImage src={transfer.playerPhoto ?? undefined} />
							</Avatar>
							<div className="flex-1">
								<CardTitle className="text-lg">{transfer.playerName}</CardTitle>
								<div className="flex items-center gap-2 mt-1">
									<span
										className={`text-xs px-2 py-1 rounded-full font-medium ${isInTransfer ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
									>
										{isInTransfer ? "IN" : "OUT"}
									</span>
									{transfer.action && (
										<span
											className={`text-xs px-2 py-1 rounded-full font-medium ${transfer.action === "BUY" ? "bg-blue-500 text-white" : "bg-orange-500 text-white"}`}
										>
											{transfer.action}
										</span>
									)}
								</div>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-3">
						{transfer.price && (
							<div className="flex flex-row-reverse items-center justify-between">
								<span className="text-sm font-semibold text-yellow-600 text-left">💰 {transfer.price}</span>
								<span className="text-sm text-muted-foreground text-right">דמי העברה</span>
							</div>
						)}
						<div className="flex flex-row-reverse items-center justify-between">
							<span className="text-sm font-medium text-left">
								{transfer.date ? new Date(transfer.date).toLocaleDateString() : "לא ידוע"}
							</span>
							<span className="text-sm text-muted-foreground text-right">תאריך</span>
						</div>
						<div className="flex flex-row-reverse items-center justify-between">
							<span className="text-sm font-medium text-left">{transfer.teamName}</span>
							<span className="text-sm text-muted-foreground text-right">קבוצה</span>
						</div>
						{transfer.type?.includes("-") && (
							<div className="pt-2 border-t">
								<p className="text-xs text-muted-foreground italic text-center">
									{transfer.type.split("-").pop()?.trim()}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</PopoverContent>
		</Popover>
	);
}

export function RecentTransfers() {
	const transfers = useAllTransfers();
	const [openTransferId, setOpenTransferId] = useState<string | null>(null);

	if (transfers === undefined) {
		return <div className="size-[88px] text-center vertical-align-middle text-slate-700 italic">טוען העברות</div>;
	}

	if (!transfers || transfers.length === 0) {
		return null;
	}

	// sort by date descending (most recent first)
	const sortedTransfers = transfers.slice().sort((a, b) => {
		const dateA = a.date ? new Date(a.date).getTime() : 0;
		const dateB = b.date ? new Date(b.date).getTime() : 0;
		return dateB - dateA;
	});

	// Separate IN and OUT transfers
	const inTransfers = sortedTransfers.filter((t) => t.direction === "IN");
	const outTransfers = sortedTransfers.filter((t) => t.direction === "OUT");

	const inTransferViews = inTransfers.map((transfer) => (
		<li key={transfer._id} className={openTransferId && openTransferId !== transfer._id ? "opacity-30" : ""}>
			<TransferView
				transfer={transfer}
				isOpen={openTransferId === transfer._id}
				onOpenChange={(open) => setOpenTransferId(open ? transfer._id : null)}
			/>
		</li>
	));

	const outTransferViews = outTransfers.map((transfer) => (
		<li key={transfer._id} className={openTransferId && openTransferId !== transfer._id ? "opacity-30" : ""}>
			<TransferView
				transfer={transfer}
				isOpen={openTransferId === transfer._id}
				onOpenChange={(open) => setOpenTransferId(open ? transfer._id : null)}
			/>
		</li>
	));

	return (
		<div className="flex flex-col gap-4 items-center">
			<div className="flex items-center gap-4">
				<h2 data-testid="recent-transfers-title">העברות אחרונות</h2>
			</div>

			{/* IN Transfers Row */}
			{inTransferViews.length > 0 && (
				<div className="flex flex-col gap-2 items-center">
					<div className="text-sm font-semibold text-green-600 mb-1">העברות פנימה (IN)</div>
					<ul className="flex flex-row gap-2 list-none">{inTransferViews}</ul>
				</div>
			)}

			{/* OUT Transfers Row */}
			{outTransferViews.length > 0 && (
				<div className="flex flex-col gap-2 items-center">
					<div className="text-sm font-semibold text-red-600 mb-1">העברות חוצה (OUT)</div>
					<ul className="flex flex-row gap-2 list-none">{outTransferViews}</ul>
				</div>
			)}
		</div>
	);
}
