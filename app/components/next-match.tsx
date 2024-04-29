import type { OpponentClass, Team } from "fotmob/dist/esm/types/team";
import type { Jsonify } from "type-fest";
import Form from "~/components/stats/form";
import TeamAvatar from "~/components/team-avatar";
import { GameTimer } from "~/game-timer";

function TeamStatus({
	game,
	isRunning = false,
	iconPosition = "before",
}: { game: Jsonify<OpponentClass>; isRunning?: boolean; iconPosition?: "before" | "after" }) {
	return (
		<div>
			<TeamAvatar teamId={game.id} teamName={game.name} iconPosition={iconPosition} />
			{isRunning && <div className="text-xs">{game.score}</div>}
		</div>
	);
}

export function NextMatchOverview({
	nextMatchOpponent,
	teamData,
}: {
	teamData: Team;
	nextMatchOpponent: Team;
}) {
	const nextGame = teamData?.overview?.nextMatch;

	if (!nextGame?.away || !nextGame?.home) return null;
	const isHome = nextGame.home?.id === teamData.details?.id;
	const homeTeam = isHome ? teamData : nextMatchOpponent;
	const awayTeam = isHome ? nextMatchOpponent : teamData;
	const awayGames = awayTeam?.fixtures?.allFixtures?.fixtures?.filter((game) => !game.notStarted);
	const homeGames = homeTeam?.fixtures?.allFixtures?.fixtures?.filter((game) => !game.notStarted);
	const awayForm = awayGames?.slice(awayGames.length - 5, awayGames.length);
	const homeForm = homeGames?.slice(homeGames.length - 5, homeGames.length).reverse();
	if (!awayForm || !homeForm) return;

	return (
		<div className="flex flex-col gap-2 pb-6 heebo bg-primary py-3 full-bleed">
			<div className="text-sm text-slate-200">{nextGame.notStarted ? "המשחק הבא" : "כרגע"}</div>
			<div className="flex flex-row-reverse items-center justify-center gap-2">
				<img
					className="h-[20px]"
					src={`https://images.fotmob.com/image_resources/logo/leaguelogo/dark/${nextGame.tournament?.leagueId}.png`}
					alt={`${nextGame.tournament?.name} logo`}
				/>
				<div className="font-bold">{nextGame.tournament?.name}</div>
			</div>
			<div className="game-title">
				<div className="flex flex-col gap-1 items-end">
					<TeamStatus game={nextGame.away} isRunning={!nextGame.notStarted} iconPosition="after" />
					<div>
						<Form form={awayForm} />
					</div>
				</div>

				{nextGame?.status?.utcTime && (
					<div className="text-xs">
						{nextGame.notStarted ? (
							new Date(nextGame.status.utcTime).toLocaleString()
						) : (
							<GameTimer start={nextGame.status.utcTime} />
						)}
					</div>
				)}
				<div className="flex flex-col gap-1 items-start">
					<TeamStatus game={nextGame.home} isRunning={!nextGame.notStarted} />
					<div>
						<Form form={homeForm} />
					</div>
				</div>
			</div>
		</div>
	);
}
