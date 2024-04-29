import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { OverviewFixture } from "fotmob/dist/esm/types/team";
export function resultToString(result?: number) {
	if (result === 1) return "W";
	if (result === 0) return "D";
	if (result === -1) return "L";
}
export function getFormColor(form: number | undefined) {
	if (form === 1) return "bg-green-400";
	if (form === -1) return "bg-red-400";
	return "bg-slate-400";
}

function getFormTextColor(form: number | undefined) {
	if (form === 1) return "text-green-400";
	if (form === -1) return "text-red-400";
	return "text-slate-200";
}

const TooltipScore: React.FC<{ game: OverviewFixture }> = ({ game }) => {
	return (
		<div className="flex flex-row gap-5">
			<Avatar className="h-[25px] w-[25px]">
				<AvatarImage src={`https://images.fotmob.com/image_resources/logo/teamlogo/${game?.home?.id}_xsmall.png`} />
				<AvatarFallback>{game?.home?.name}</AvatarFallback>
			</Avatar>
			<div className={`text-xl direction-alternate ${getFormTextColor(game?.result)}`}>{game.status?.scoreStr}</div>
			<Avatar className="h-[25px] w-[25px]">
				<AvatarImage src={`https://images.fotmob.com/image_resources/logo/teamlogo/${game?.away?.id}_xsmall.png`} />
				<AvatarFallback>{game?.away?.name}</AvatarFallback>
			</Avatar>
		</div>
	);
};

export const ResultTooltip: React.FC<React.HTMLAttributes<HTMLDivElement> & { game: OverviewFixture }> = ({
	game,
	children,
}) => (
	<TooltipProvider key={game.id}>
		<Tooltip>
			<TooltipTrigger>{children}</TooltipTrigger>
			<TooltipContent side="top" className="rounded-xl bg-primary border-accent">
				<TooltipScore game={game} />
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
);

const Form: React.FC<{ form: OverviewFixture[] }> = ({ form }) => {
	return form.map((game) => (
		<ResultTooltip game={game} key={game.id}>
			<Avatar className="h-[25px] w-[25px]">
				<AvatarFallback className={`scale-75 ${getFormColor(game?.result)}`}>
					{resultToString(game.result)}
				</AvatarFallback>
			</Avatar>
		</ResultTooltip>
	));
};

export default Form;
