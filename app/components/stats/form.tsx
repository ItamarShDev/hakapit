import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { getTeamForm } from "~/components/next-match";

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
type Form = ReturnType<typeof getTeamForm>;
const TooltipScore: React.FC<{ game: Form[0] }> = ({ game }) => {
	return (
		<div className="flex flex-row gap-5">
			<Avatar className="h-[25px] w-[25px]">
				<AvatarImage src={`https://images.fotmob.com/image_resources/logo/teamlogo/${game.homeTeam.id}_xsmall.png`} />
				<AvatarFallback>{game.homeTeam.name}</AvatarFallback>
			</Avatar>
			<div className={`text-xl direction-alternate ${getFormTextColor(game.letter)}`}>{game.result}</div>
			<Avatar className="h-[25px] w-[25px]">
				<AvatarImage src={`https://images.fotmob.com/image_resources/logo/teamlogo/${game.awayTeam.id}_xsmall.png`} />
				<AvatarFallback>{game.awayTeam.name}</AvatarFallback>
			</Avatar>
		</div>
	);
};

export const ResultTooltip: React.FC<React.HTMLAttributes<HTMLDivElement> & { game: Form[0] }> = ({
	game,
	children,
}) => (
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger>{children}</TooltipTrigger>
			<TooltipContent side="bottom" className="rounded-xl bg-slate-700 border-primary">
				<TooltipScore game={game} />
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
);

export const TeamForm: React.FC<{ form: Form }> = ({ form }) => {
	return form.map((game, index) => (
		<ResultTooltip game={game} key={`${index}-${game.result}`}>
			<Avatar className="h-[25px] w-[25px]">
				<AvatarFallback className={`scale-75 ${game && getFormColor(game.letter)}`}>{game.letter}</AvatarFallback>
			</Avatar>
		</ResultTooltip>
	));
};
