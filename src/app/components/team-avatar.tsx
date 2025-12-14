import { Image } from "@unpic/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/@/components/ui/tooltip";
import type { Team } from "~/app/providers/soccer-api/types/league";

export default function TeamAvatar({
	team,
	iconPosition = "before",
	color,
	hoverable = false,
}: {
	team: Team;
	iconPosition?: "before" | "after";
	color?: string;
	hoverable?: boolean;
}) {
	const { id: teamId, name: teamName, shortName: teamShortName, crest } = team;
	if (!teamId) return null;
	const teamNameComponent = (
		<div className="text-amber-100" style={{ color }}>
			{teamName}
		</div>
	);
	const avatar = (
		<Avatar className="size-[25px]" style={{ width: 25, height: 25 }}>
			<AvatarImage asChild>
				<Image src={crest} width={25} height={25} loading="eager" alt={teamShortName || "TL"} />
			</AvatarImage>
			<AvatarFallback />
		</Avatar>
	);
	if (hoverable)
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>{avatar}</TooltipTrigger>
					<TooltipContent side="bottom" className="rounded-xl bg-primary border-accent text-accent">
						<div>{teamName}</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	return (
		<div className={`flex items-center gap-3 ${iconPosition === "after" ? "justify-end" : "justify-start"}`}>
			{iconPosition === "after" && teamNameComponent}
			{avatar}
			{iconPosition === "before" && teamNameComponent}
		</div>
	);
}
