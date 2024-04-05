import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTeamImage } from "~/api/sofascore-api/constants";

export default function TeamAvatar({
	teamName,
	teamShortName = teamName,
	teamId,
	iconPosition = "before",
	color,
}: {
	teamId?: number;
	teamName?: string;
	teamShortName?: string;
	iconPosition?: "before" | "after";
	color?: string;
}) {
	if (!teamId) return null;
	const teamNameComponent = (
		<div className="text-amber-100" style={{ color }}>
			{teamName}
		</div>
	);
	return (
		<div className={`flex items-center gap-3 ${iconPosition === "after" ? "justify-end" : "justify-start"}`}>
			{iconPosition === "after" && teamNameComponent}
			<Avatar className="h-[25px] w-[25px]">
				<AvatarImage src={getTeamImage(teamId)} />
				<AvatarFallback className="scale-75">{teamShortName}</AvatarFallback>
			</Avatar>
			{iconPosition === "before" && teamNameComponent}
		</div>
	);
}
