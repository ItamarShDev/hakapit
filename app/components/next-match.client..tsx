"use client";
import type { OpponentClass, OverviewFixture, Team } from "fotmob/dist/esm/types/team";
import { useCallback, useEffect, useState } from "react";
import Form from "~/components/stats/form";
import TeamAvatar from "~/components/team-avatar";
import { heebo } from "~/fonts";
import { GameTimer } from "~/game-timer";
import { getNextMatchData } from "~/server/fotmob-api";

function TeamStatus({
	game,
	isRunning = false,
	iconPosition = "before",
}: { game: OpponentClass; isRunning?: boolean; iconPosition?: "before" | "after" }) {
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
function useTeamForms(data: Awaited<ReturnType<typeof getNextMatchData>>) {
	const gameData = useGameStatus(data);
	const { teamData, nextMatchOpponent } = gameData;
	const nextGame = teamData?.overview?.nextMatch;
	if (!nextGame?.away || !nextGame?.home) {
		return null;
	}
	const isHome = nextGame.home?.id === teamData.details?.id;
	const [homeTeam, awayTeam] = isHome ? [teamData, nextMatchOpponent] : [nextMatchOpponent, teamData];

	const getRecentGames = (team: Team) =>
		team?.fixtures?.allFixtures?.fixtures?.filter((game) => !game.notStarted) ?? [];

	const awayGames = getRecentGames(awayTeam);
	const homeGames = getRecentGames(homeTeam);

	const getLastFiveGames = (games: OverviewFixture[]) => games.slice(-5);

	const awayForm = getLastFiveGames(awayGames);
	const homeForm = getLastFiveGames(homeGames).reverse();

	return { awayForm, homeForm, nextGame };
}

export function NextMatchOverviewClient({ data }: { data: Awaited<ReturnType<typeof getNextMatchData>> }) {
	const teamForms = useTeamForms(data);
	if (!teamForms) {
		return null;
	}
	const { awayForm, homeForm, nextGame } = teamForms;
	if (!nextGame?.away || !nextGame?.home) {
		return null;
	}
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
