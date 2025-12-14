import { Avatar, AvatarFallback, AvatarImage } from "~/@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/@/components/ui/tooltip";
import { LiverpoolId } from "~/app/providers/soccer-api/constants";
import type { Match } from "~/app/providers/soccer-api/types/team-matches";
export function resultToString(match: Match) {
	const isHome = match.homeTeam.id === LiverpoolId;
	const isWon = isHome ? match.score.winner === "HOME_TEAM" : match.score.winner === "AWAY_TEAM";
	if (match.score.winner === "DRAW") {
		return "D";
	}
	if (isWon) return "W";
	return "L";
}
export function getFormColor(match: Match) {
	const isHome = match.homeTeam.id === LiverpoolId;
	const isWon = isHome ? match.score.winner === "HOME_TEAM" : match.score.winner === "AWAY_TEAM";
	if (match.score.winner === "DRAW") {
		return "bg-slate-400";
	}
	if (isWon) return "bg-green-400";
	return "bg-red-400";
}

function getFormTextColor(match: Match) {
	const isHome = match.homeTeam.id === LiverpoolId;
	const isWon = isHome ? match.score.winner === "HOME_TEAM" : match.score.winner === "AWAY_TEAM";
	if (match.score.winner === "DRAW") {
		return "text-slate-200";
	}
	if (isWon) return "text-green-400";
	return "text-red-400";
}
function scoreString(score: Match["score"]) {
	return `${score.fullTime.home} - ${score.fullTime.away}`;
}

const TooltipScore: React.FC<{ game: Match }> = ({ game }) => {
	return (
		<div className="flex flex-row gap-5">
			<Avatar className="h-[25px] w-[25px]">
				<AvatarImage src={game.homeTeam.crest} />
				<AvatarFallback>{game.homeTeam.name}</AvatarFallback>
			</Avatar>
			<div className={`text-xl direction-alternate ${getFormTextColor(game)}`}>{scoreString(game.score)}</div>
			<Avatar className="h-[25px] w-[25px]">
				<AvatarImage src={game.awayTeam.crest} />
				<AvatarFallback>{game.awayTeam.name}</AvatarFallback>
			</Avatar>
		</div>
	);
};

export const ResultTooltip: React.FC<React.HTMLAttributes<HTMLDivElement> & { game: Match }> = ({ game, children }) => (
	<TooltipProvider key={game.id}>
		<Tooltip>
			<TooltipTrigger>{children}</TooltipTrigger>
			<TooltipContent side="top" className="rounded-xl bg-popover border-accent">
				<TooltipScore game={game} />
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
);

const Form: React.FC<{ form?: Match[] }> = ({ form }) => {
	return form?.map((game) => (
		<ResultTooltip game={game} key={game.id}>
			<Avatar className="h-[25px] w-[25px]">
				<AvatarFallback className={`scale-75 ${getFormColor(game)}`}>{resultToString(game)}</AvatarFallback>
			</Avatar>
		</ResultTooltip>
	));
};

export default Form;
