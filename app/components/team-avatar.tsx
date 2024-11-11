import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type ImageProps, getImageProps } from "next/image";
import type { Team } from "~/server/soccer-api/types/league";

type Props = Omit<ImageProps, "fill">;

export function NextAvatar(props: Props) {
	const imageProps = getImageProps({ width: 40, height: 40, ...props }).props;
	const { blurDataURL, style, ...imagePropsSanitized } = imageProps;
	return (
		<Avatar
			className={props.className}
			style={{ width: imagePropsSanitized.width, height: imagePropsSanitized.height }}
		>
			<AvatarImage
				{...imagePropsSanitized}
				style={{ objectFit: imageProps.style.objectFit, objectPosition: imageProps.style.objectPosition }}
			/>
			{imageProps.placeholder === "blur" && <AvatarFallback style={imageProps.style} />}
		</Avatar>
	);
}
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
		<NextAvatar src={crest} width={25} height={25} priority fetchPriority="high" alt={teamShortName || "TL"} />
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
