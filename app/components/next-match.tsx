import type { OpponentClass } from "fotmob/dist/esm/types/team";
import { useEffect, useMemo, useState } from "react";
import type { Jsonify } from "type-fest";
import type { getNextMatchData } from "~/api/sofascore-api/index.server";
import type { LeagueForm } from "~/api/sofascore-api/types/forms";
import { TeamForm } from "~/components/stats/form";
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

export function getTeamForm(form: LeagueForm, teamId: number) {
	return form.events
		.filter(
			(event, index) =>
				event.status.code === 100 && (event.awayTeam.id === teamId || event.homeTeam.id === teamId) && index < 5,
		)
		.map((event) => {
			const isHome = event.awayTeam.id === teamId;
			let letter = null;
			let result = null;
			const awayTeam = event.awayTeam;
			const homeTeam = event.homeTeam.id;
			if (isHome) {
				letter = event.winnerCode === 1 ? "W" : event.winnerCode === 0 ? "D" : "L";
				result = `${event.homeScore.current}-${event.awayScore.current}`;
			} else {
				letter = event.winnerCode === 2 ? "W" : event.winnerCode === 0 ? "D" : "L";
				result = `${event.awayScore.current}-${event.homeScore.current}`;
			}
			return {
				letter,
				result,
				homeTeam,
				awayTeam,
			};
		});
}

export function NextMatchOverview({
	nextMatch: { nextMatch, form },
}: {
	nextMatch: Jsonify<Awaited<ReturnType<typeof getNextMatchData>>>;
}) {
	const _homeTeam = useMemo(() => nextMatch?.homeTeam, [nextMatch]);
	const _awayTeam = useMemo(() => nextMatch?.awayTeam, [nextMatch]);
	if (!_homeTeam || !_awayTeam) return null;

	const awayForm = getTeamForm(form, _awayTeam.id);
	const homeForm = getTeamForm(form, _homeTeam.id);

	return (
		<div className="flex flex-col gap-2 pb-6 heebo">
			<div className="text-sm text-slate-300">{nextMatch?.startTimestamp ? "המשחק הבא" : "כרגע"}</div>
			<div className="flex flex-row-reverse items-center justify-center gap-2">
				<img
					className="h-[20px]"
					src={`https://images.fotmob.com/image_resources/logo/leaguelogo/${nextMatch?.tournament.id}.png`}
					alt={`${nextMatch} logo`}
				/>
				<div className="font-bold">{nextMatch?.tournament.name}</div>
			</div>
			<div className="game-title">
				<div>
					{/* <TeamStatus game={nextGame.away} isRunning={!nextGame.notStarted} iconPosition="after" /> */}
					<TeamForm form={awayForm} />
				</div>

				{nextMatch?.status.type && (
					<div className="text-xs">
						{nextMatch?.status.type ? (
							new Date(nextMatch.startTimestamp).toLocaleString()
						) : (
							<GameTimer start={nextMatch.startTimestamp} />
						)}
					</div>
				)}
				<div>
					{/* <TeamStatus game={nextGame.home} isRunning={!nextGame.notStarted} /> */}
					<TeamForm form={homeForm} />
				</div>
			</div>
			{/* const color = useCallback(
							(idx: number, color: "text" | "team" = "team") => {
								if (idx === 1) return "gray";
								const colorMap = {
									text: nextGameData?.general?.teamColors?.fontDarkMode,
									team: nextGameData?.general?.teamColors?.darkMode,
								};
								return colorMap[color]?.[idx === 0 ? "home" : "away"];
							},
							[nextGameData],
						);

						return (
							<div className="w-full flex justify-around flex-row-reverse">
								{nextGameData.content?.h2h?.summary?.map((game, index) => (
									<div className="flex flex-col items-center gap-1">
										<div className="text-sm" style={{ color: color(index) }}>
											{game}
										</div>
										<div className="text-xs" style={{ color: color(index, "text") }}>
											{index === 1 ? "תיקו" : "נצחונות"}
										</div>
									</div>
								))}
							</div> */}
		</div>
	);
}
