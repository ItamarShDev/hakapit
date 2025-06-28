"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ShowMore({ limit = 1, currentLimit = 1 }: { limit?: number; currentLimit?: number }) {
	const [isLoading, setIsLoading] = useState(false);
	// biome-ignore lint/correctness/useExhaustiveDependencies: false positive
	useEffect(() => {
		setIsLoading(false);
	}, [limit]);
	if (currentLimit < limit) {
		return null;
	}
	return (
		<Link
			href={`?limit=${limit + 10}`}
			replace
			className={cn("text-xl lg:text-sm text-accent", isLoading && "animate animate-pulse")}
			scroll={false}
			onClick={() => setIsLoading(true)}
		>
			הצג עוד
		</Link>
	);
}
