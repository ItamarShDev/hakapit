"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { QuestionMarkIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import MenuIcon from "~/components/icons/menu";
import { Links } from "~/components/links";
import { karantina } from "~/fonts";
function WhatIsKapit() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger className=" flex items-center font-sans">
					<div className="text-accent text-sm">מה זה כפית</div>
					<QuestionMarkIcon className="text-accent w-5 h-5 p-1" />
				</TooltipTrigger>
				<TooltipContent side="bottom" className="rounded-xl bg-primary border-accent">
					<div className="what-is-kapit text-slate-300 py-2">
						<p className="fade-in-bottom a-delay-100">כפית זה משחק של אופי.</p>
						<p className="fade-in-bottom a-delay-400">כפית זה ניצחון ברגע האחרון.</p>
						<p className="fade-in-bottom a-delay-700">כפית זה כל כך פשוט וכל כך קשה.</p>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
type Props = {
	data: { imageUrl: string; title: string };
	podcast: string | undefined;
} & React.HTMLAttributes<HTMLElement>;
export default function Header({ data }: Props) {
	const { imageUrl } = data;
	const [open, setOpen] = useState(false);
	return (
		<header className="header overflow-hidden">
			<div className="lg:items-center flex flex-wrap items-start gap-4 p-4">
				<div className="header-image">
					{imageUrl && (
						<Image
							src={imageUrl}
							alt="podcast logo"
							className="object-contain"
							priority={true}
							width={48}
							height={48}
						/>
					)}
				</div>
				<div className={cn("flex-1 header-title flex gap-3 items-baseline", karantina.className)}>
					<Link href="/">
						<h1>{data.title}</h1>
					</Link>
					<WhatIsKapit />
				</div>
				<div className="lg:gap-4 lg:hidden flex flex-col flex-wrap items-end gap-2 pt-2">
					<Button onClick={() => setOpen(!open)} variant="link" className="menu-button">
						<MenuIcon />
					</Button>
				</div>
				<Links className="lg:flex flex-row hidden" />
			</div>
			<div className={cn("grid-transition header-links grid items-start", open ? "show-menu" : "hide-menu")}>
				<Links className="flex flex-col items-center text-2xl" onSelect={() => setOpen(false)} />
			</div>
		</header>
	);
}
