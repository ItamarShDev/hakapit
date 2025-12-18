import { Image } from "@unpic/react";
import type React from "react";
import Form from "~/app/components/stats/Form";
import TeamNameAndAvatar from "~/app/components/team-avatar";
import { heebo } from "~/app/fonts";
import type { Team } from "~/app/providers/soccer-api/types/team-matches";

function TeamStatus({
	team,
	score,
	isRunning = false,
	iconPosition = "before",
}: {
	team: Team;
	score?: number;
	isRunning?: boolean;
	iconPosition?: "before" | "after";
}) {
	return (
		<div>
			<TeamNameAndAvatar team={team} iconPosition={iconPosition} />
			{isRunning && <div className="text-xs">{score}</div>}
		</div>
	);
}

export function FullBleed({
	children,
	...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={`flex flex-col gap-2  pb-6 bg-primary py-3 full-bleed ${heebo.className}`} {...props}>
			{children}
		</div>
	);
}

import type { NextMatchData } from "~/app/providers/soccer-api";
import { getDisplayScore } from "./utils";

export function NextMatchOverview({ nextMatchData }: { nextMatchData: NextMatchData | undefined }) {
	if (!nextMatchData) {
		return null;
	}
	const { awayForm, homeForm, nextGame } = nextMatchData;
	if (!nextMatchData.awayForm || !nextMatchData.homeForm || !nextGame) {
		return null;
	}

	return (
		<FullBleed data-testid="next-match-overview">
			<div className="flex justify-center">
				<div className="text-slate-200 text-sm">{nextGame.status === "LIVE" ? "כרגע" : "המשחק הבא"}</div>
			</div>
			<div className="flex flex-row items-center justify-center gap-2">
				<div className="font-bold">{nextGame.competition.name}</div>
				<Image
					className="h-[20px]"
					width={20}
					height={20}
					src={nextGame.competition.emblem}
					alt={`${nextGame.competition.name} logo`}
				/>
			</div>
			<div className={`game-title ${heebo.className}`}>
				<div className="flex flex-col items-end gap-1">
					<TeamStatus
						team={nextGame.awayTeam}
						isRunning={nextGame.status === "LIVE"}
						iconPosition="after"
						score={getDisplayScore(nextGame.score, "away") ?? undefined}
					/>
					<div>
						<Form form={awayForm} />
					</div>
				</div>

				{nextGame?.utcDate && (
					<div className="max-w-24 text-wrap text-xs">
						{new Date(nextGame.utcDate).toLocaleDateString()} {new Date(nextGame.utcDate).toLocaleTimeString()}
					</div>
				)}
				<div className="flex flex-col items-start gap-1">
					<TeamStatus
						team={nextGame.homeTeam}
						isRunning={nextGame.status === "LIVE"}
						score={getDisplayScore(nextGame.score, "home") ?? undefined}
					/>
					<div>
						<Form form={homeForm} />
					</div>
				</div>
			</div>
		</FullBleed>
	);
}
