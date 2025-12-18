import { Image } from "@unpic/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/@/components/ui/tooltip";
import type { Team } from "~/app/providers/soccer-api/types/league";

export default function TeamNameAndAvatar({
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
	if (!teamId) {
		return null;
	}

	const teamNameComponent = (
		<div className="text-amber-100" style={{ color }}>
			{teamName}
		</div>
	);

	const teamCrest = (
		<div className="size-6.25 rounded-full overflow-hidden" style={{ width: 25, height: 25 }}>
			<Image src={crest} width={25} height={25} loading="eager" alt={teamShortName || "TL"} />
		</div>
	);

	if (hoverable) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>{teamCrest}</TooltipTrigger>
					<TooltipContent side="bottom" className="rounded-xl bg-primary border-accent text-accent">
						<div>{teamName}</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<div className={`flex items-center gap-3 ${iconPosition === "after" ? "justify-end" : "justify-start"}`}>
			{iconPosition === "after" && teamNameComponent}
			{teamCrest}
			{iconPosition === "before" && teamNameComponent}
		</div>
	);
}
