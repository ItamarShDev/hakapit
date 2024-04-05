import { useEffect, useMemo, useState } from "react";
import type { Jsonify } from "type-fest";
import { getLeagueImage } from "~/api/sofascore-api/constants";
import type { getNextMatchData } from "~/api/sofascore-api/index.server";
import type { LeagueForm } from "~/api/sofascore-api/types/forms";
import { TeamForm } from "~/components/stats/form";
import TeamAvatar from "~/components/team-avatar";
type MatchData = Jsonify<Awaited<ReturnType<typeof getNextMatchData>>>;
type Match = MatchData["nextMatch"];
function GameTimer({ start }: { start: Date }) {
	const [time, setTime] = useState(start.getTime() - Date.now());
	useEffect(() => {
		const interval = setInterval(() => {
			setTime(start.getTime() - Date.now());
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
	team,
	score,
	iconPosition = "before",
}: {
	team: Match["homeTeam" | "awayTeam"];
	score?: Match["awayScore" | "homeScore"]["current"];
	iconPosition?: "before" | "after";
}) {
	return (
		<div>
			<TeamAvatar teamId={team.id} teamName={team.name} teamShortName={team.shortName} iconPosition={iconPosition} />
			{score !== undefined && <div className="text-xs">{score}</div>}
		</div>
	);
}

export function getLetter(winnerCode: number, isHome: boolean) {
	if (isHome) {
		if (winnerCode === 1) {
			return "W" as const;
		}
		if (winnerCode === 3) {
			return "D" as const;
		}
		if (winnerCode === 2) {
			return "L" as const;
		}
	} else {
		if (winnerCode === 1) {
			return "L" as const;
		}
		if (winnerCode === 3) {
			return "D" as const;
		}
		if (winnerCode === 2) {
			return "W" as const;
		}
	}
}

export function getTeamForm(form: LeagueForm, teamId: number) {
	const events = form.events.filter((event) => event.status.code === 100).toReversed();
	const games = events.filter((event) => [event.awayTeam.id, event.homeTeam.id].includes(teamId));
	return games.map((event) => {
		const isHome = event.homeTeam.id === teamId;
		const awayTeam = event.awayTeam;
		const homeTeam = event.homeTeam;

		return {
			letter: getLetter(event.winnerCode, isHome),
			result: `${event.awayScore.display}-${event.homeScore.display}`,
			homeTeam,
			awayTeam,
		};
	});
}

export function NextMatchOverview({
	nextMatch: { nextMatch, form, h2h },
}: {
	nextMatch: MatchData;
}) {
	const _homeTeam = useMemo(() => nextMatch?.homeTeam, [nextMatch]);
	const _awayTeam = useMemo(() => nextMatch?.awayTeam, [nextMatch]);

	if (!_homeTeam || !_awayTeam) return null;
	const gameTimestamp = new Date(nextMatch.startTimestamp * 1000);
	const homeForm = getTeamForm(form, _homeTeam.id);
	const awayForm = getTeamForm(form, _awayTeam.id);
	const h2hSummary = h2h.events
		?.filter((game) => game.status.code === 100)
		.reduce(
			(acc, game) => {
				if (game.winnerCode === 1) {
					acc[game.homeTeam.id]++;
				} else if (game.winnerCode === 3) {
					acc[0]++;
				} else {
					acc[game.awayTeam.id]++;
				}
				return acc;
			},
			{
				[_homeTeam.id]: 0,
				[_awayTeam.id]: 0,
				0: 0,
			},
		);
	return (
		<div className="flex flex-col gap-2 pb-6 heebo">
			<div>{nextMatch?.startTimestamp ? "המשחק הבא" : "כרגע"}</div>
			<div className="flex flex-row-reverse items-center justify-center gap-2">
				<img
					className="h-[20px]"
					src={getLeagueImage(nextMatch?.tournament.uniqueTournament.id)}
					alt={`${nextMatch} logo`}
				/>
				<div className="font-bold">{nextMatch?.tournament.name}</div>
			</div>
			<div className="game-title">
				<div>
					<TeamStatus team={nextMatch.awayTeam} score={nextMatch.awayScore?.current} iconPosition="after" />
					<TeamForm form={awayForm.slice(0, 5)} />
				</div>

				{nextMatch?.status.type && (
					<div className="text-xs">
						{nextMatch?.status.type ? gameTimestamp.toLocaleString() : <GameTimer start={gameTimestamp} />}
					</div>
				)}
				<div>
					<TeamStatus team={nextMatch.homeTeam} score={nextMatch.homeScore?.current} />
					<TeamForm form={homeForm.slice(0, 5)} />
				</div>
			</div>
			<div className="flex flex-col gap-3">
				<div className="text-sm text-slate-300">ראש בראש</div>
				<div className="w-full flex justify-around flex-row-reverse">
					<div className="text-sm" style={{ color: _homeTeam.teamColors.primary }}>
						{h2hSummary[_homeTeam.id]}
					</div>
					<div className="text-xs">{h2hSummary[0]}</div>
					<div className="text-sm" style={{ color: _awayTeam.teamColors.primary }}>
						{h2hSummary[_awayTeam.id]}
					</div>
				</div>
			</div>
		</div>
	);
}
