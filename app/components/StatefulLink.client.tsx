"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentProps, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function StatefulLink({ children, href, ...props }: ComponentProps<typeof Link>) {
	const [isLoading, setIsLoading] = useState(false);
	const path = usePathname();

	useEffect(() => {
		if (isLoading && path === href) {
			setIsLoading(false);
		}
	}, [isLoading, href, path]);

	return (
		<Link
			href={href}
			replace
			className={cn(props.className, isLoading && "animate animate-pulse")}
			scroll={false}
			onClick={() => setIsLoading(true)}
		>
			{children}
		</Link>
	);
}
