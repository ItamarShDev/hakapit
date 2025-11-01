"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
	isLoading: boolean;
	onClick?: () => void;
}

export function RefreshButton({ isLoading, onClick }: RefreshButtonProps) {
	return (
		<Button
			variant="outline"
			size="sm"
			onClick={onClick}
			disabled={isLoading}
			className="flex items-center gap-2"
		>
			<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
			רענן
		</Button>
	);
}
