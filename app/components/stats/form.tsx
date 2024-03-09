import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { TeamForm } from "fotmob/dist/esm/types/team";
import type { Jsonify } from "type-fest";

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
				<AvatarImage src={`https://images.fotmob.com/image_resources/logo/teamlogo/${score?.homeTeamId}_xsmall.png`} />
				<AvatarFallback>{score?.homeTeam}</AvatarFallback>
			</Avatar>
			<div className={`text-xl direction-alternate ${game?.resultString && getFormTextColor(game?.resultString)}`}>
				{game.score}
			</div>
			<Avatar className="h-[25px] w-[25px]">
				<AvatarImage src={`https://images.fotmob.com/image_resources/logo/teamlogo/${score?.awayTeamId}_xsmall.png`} />
				<AvatarFallback>{score?.awayTeam}</AvatarFallback>
			</Avatar>
		</div>
	);
};

export const ResultTooltip: React.FC<React.HTMLAttributes<HTMLDivElement> & { game: Jsonify<TeamForm> }> = ({
	game,
	children,
}) => (
	<TooltipProvider key={game.linkToMatch}>
		<Tooltip>
			<TooltipTrigger>{children}</TooltipTrigger>
			<TooltipContent side="bottom" className="rounded-xl bg-slate-700 border-primary">
				<TooltipScore game={game} />
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
);

const Form: React.FC<{ form: Jsonify<TeamForm>[] }> = ({ form }) => {
	return form.map((game) => (
		<ResultTooltip game={game} key={game.linkToMatch}>
			<Avatar className="h-[25px] w-[25px]">
				<AvatarFallback className={`scale-75 ${game?.resultString && getFormColor(game?.resultString)}`}>
					{game.resultString}
				</AvatarFallback>
			</Avatar>
		</ResultTooltip>
	));
};

export default Form;
