import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TeamAvatar({
	teamName,
	teamShortName = teamName,
	teamId,
	iconPosition = "before",
}: {
	teamId?: string | number;
	teamName?: string;
	teamShortName?: string;
	iconPosition?: "before" | "after";
}) {
	if (!teamId) return null;
	const teamNameComponent = <div className="text-amber-100">{teamName}</div>;
	return (
		<div className={`flex items-center gap-3 ${iconPosition === "after" ? "justify-end" : "justify-start"}`}>
			{iconPosition === "after" && teamNameComponent}
			<Avatar className="h-[25px] w-[25px]">
				<AvatarImage src={`https://images.fotmob.com/image_resources/logo/teamlogo/${teamId}_xsmall.png`} />
				<AvatarFallback className="scale-75">{teamShortName}</AvatarFallback>
			</Avatar>
			{iconPosition === "before" && teamNameComponent}
		</div>
	);
}
