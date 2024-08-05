"use client";
import type { OpponentClass } from "fotmob/dist/esm/types/team";
import { useCallback, useEffect, useState } from "react";
import type { Jsonify } from "type-fest";
import Form from "~/components/stats/form";
import TeamAvatar from "~/components/team-avatar";
import { heebo } from "~/fonts";
import { GameTimer } from "~/game-timer";
import { getNextMatchData } from "~/server/fotmob-api";

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

function useGameStatus(rootData: Awaited<ReturnType<typeof getNextMatchData>>) {
	const [data, setData] = useState(rootData);
	const updateData = useCallback(() => {
		getNextMatchData().then((data) => setData(data));
	}, []);

	useEffect(() => {
		if (!data) {
			return updateData();
		}
		const nextGame = data.teamData?.overview?.nextMatch;

		if (nextGame?.status?.started) {
			const interval = setInterval(updateData, 1000);
			return () => clearInterval(interval);
		}
	}, [data, updateData]);
	return data;
}
export function FullBleed({ children }: { children: React.ReactNode }) {
	return <div className={`flex flex-col gap-2  pb-6 bg-primary py-3 full-bleed ${heebo.className}`}>{children}</div>;
}

export function NextMatchOverviewClient({ data }: { data: Awaited<ReturnType<typeof getNextMatchData>> }) {
	const gameData = useGameStatus(data);
	const { teamData, nextMatchOpponent } = gameData;
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
		<FullBleed>
			<div className="text-slate-200 text-sm">{nextGame.status?.started ? "כרגע" : "המשחק הבא"}</div>
			<div className="flex flex-row-reverse items-center justify-center gap-2">
				<img
					className="h-[20px]"
					src={`https://images.fotmob.com/image_resources/logo/leaguelogo/dark/${nextGame.tournament?.leagueId}.png`}
					alt={`${nextGame.tournament?.name} logo`}
				/>
				<div className="font-bold">{nextGame.tournament?.name}</div>
			</div>
			<div className={`game-title ${heebo.className}`}>
				<div className="flex flex-col items-end gap-1">
					<TeamStatus game={nextGame.away} isRunning={nextGame.status?.started} iconPosition="after" />
					<div>
						<Form form={awayForm} />
					</div>
				</div>

				{nextGame?.status?.utcTime && (
					<div className="max-w-24 text-wrap text-xs">
						{nextGame.status?.started ? (
							<GameTimer start={nextGame.status.utcTime} />
						) : (
							`${new Date(nextGame.status.utcTime).toLocaleDateString()} ${new Date(
								nextGame.status.utcTime,
							).toLocaleTimeString()}`
						)}
					</div>
				)}
				<div className="flex flex-col items-start gap-1">
					<TeamStatus game={nextGame.home} isRunning={nextGame.status?.started} />
					<div>
						<Form form={homeForm} />
					</div>
				</div>
			</div>
		</FullBleed>
	);
}
