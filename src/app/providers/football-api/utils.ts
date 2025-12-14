export function isTransferBuy(transferType: string | null | undefined) {
	return (
		transferType !== "Loan" &&
		transferType !== "Free Transfer" &&
		transferType !== "Back from Loan" &&
		transferType !== null &&
		transferType !== undefined &&
		transferType !== "N/A"
	);
}
