"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentProps, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function StatefulLink({
	children,
	href,
	...props
}: ComponentProps<typeof Link>) {
	return (
		<Link href={href} replace className={props.className} scroll={false}>
			{children}
		</Link>
	);
}
