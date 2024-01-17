import { NextMatch, OpponentClass } from "fotmob/dist/types/team";
import { useEffect, useState } from "react";
import type { Jsonify } from "type-fest";
import TeamAvatar from "~/components/team-avatar";

function GameTimer({ start }: { start: string }) {
	const [time, setTime] = useState(new Date(start).getTime() - Date.now());
	useEffect(() => {
		const interval = setInterval(() => {
			setTime(new Date(start).getTime() - Date.now());
		}, 1000);
		return () => clearInterval(interval);
	}, [start]);
	const minutes = Math.floor(time / 1000 / 60);
	const seconds = Math.floor((time / 1000) % 60);
	return (
		<div>
			{minutes}:{seconds < 10 ? `0${seconds}` : seconds}
		</div>
	);
}

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

export default function NextMatchOverview({ nextGame }: { nextGame: Jsonify<NextMatch> }) {
	if (!nextGame.away || !nextGame.home) return null;
	return (
		<div className="flex flex-col gap-2 pb-6 heebo">
			<div className="text-sm text-slate-300">{nextGame.notStarted ? "המשחק הבא" : "כרגע"}</div>
			<div className="flex flex-row-reverse items-center justify-center gap-2">
				<img
					className="h-[20px]"
					src={`https://images.fotmob.com/image_resources/logo/leaguelogo/${nextGame.tournament?.leagueId}.png`}
					alt={nextGame.tournament?.name}
				/>
				<div className="font-bold">{nextGame.tournament?.name}</div>
			</div>
			<div className="game-title">
				<TeamStatus game={nextGame.away} isRunning={!nextGame.notStarted} iconPosition="after" />

				{nextGame?.status?.utcTime && (
					<div className="text-xs">
						{nextGame.notStarted ? (
							new Date(nextGame.status.utcTime).toLocaleString()
						) : (
							<GameTimer start={nextGame.status.utcTime} />
						)}
					</div>
				)}
				<TeamStatus game={nextGame.home} isRunning={!nextGame.notStarted} />
			</div>
		</div>
	);
}
