import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Jsonify } from "type-fest";
import type { TeamForm } from "~/api/fotmob-api/src/types/team";

export function getFormColor(form: string) {
	if (form === "W") return "bg-green-400";
	if (form === "D") return "bg-slate-400";
	if (form === "L") return "bg-red-400";
}

function getFormTextColor(form: string) {
	if (form === "W") return "text-green-400";
	if (form === "D") return "text-slate-400";
	if (form === "L") return "text-red-400";
}

const TooltipScore: React.FC<{ game: Jsonify<TeamForm> }> = ({ game }) => {
	const score = game.tooltipText;
	return (
		<div className="flex flex-row gap-5">
			<Avatar className="h-[25px] w-[25px]">
				<AvatarImage
					src={`https://images.fotmob.com/image_resources/logo/teamlogo/${score.homeTeamId}_xsmall.png`}
				/>
				<AvatarFallback>{score.homeTeam}</AvatarFallback>
			</Avatar>
			<div
				className={`text-xl direction-alternate ${getFormTextColor(
					game.resultString,
				)}`}
			>
				{game.score}
			</div>
			<Avatar className="h-[25px] w-[25px]">
				<AvatarImage
					src={`https://images.fotmob.com/image_resources/logo/teamlogo/${score.awayTeamId}_xsmall.png`}
				/>
				<AvatarFallback>{score.awayTeam}</AvatarFallback>
			</Avatar>
		</div>
	);
};

export const ResultTooltip: React.FC<
	React.HTMLAttributes<HTMLDivElement> & { game: Jsonify<TeamForm> }
> = ({ game, children }) => (
	<TooltipProvider key={game.linkToMatch}>
		<Tooltip>
			<TooltipTrigger>{children}</TooltipTrigger>
			<TooltipContent side="bottom" className="rounded-xl">
				<TooltipScore game={game} />
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
);
