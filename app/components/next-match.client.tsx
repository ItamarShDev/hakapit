import Image from "next/image";
import Form from "~/components/stats/form";
import TeamAvatar from "~/components/team-avatar";
import { heebo } from "~/fonts";
import { type getNextMatchData, getTeamPastMatches } from "~/providers/soccer-api";
import type { Team } from "~/providers/soccer-api/types/team-matches";

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
			<TeamAvatar team={team} iconPosition={iconPosition} />
			{isRunning && <div className="text-xs">{score}</div>}
		</div>
	);
}

export function FullBleed({ children }: { children: React.ReactNode }) {
	return <div className={`flex flex-col gap-2  pb-6 bg-primary py-3 full-bleed ${heebo.className}`}>{children}</div>;
}
async function getTeamForms(data: Awaited<ReturnType<typeof getNextMatchData>>) {
	const { matchDetails } = data;

	if (!matchDetails?.awayTeam || !matchDetails?.homeTeam) {
		return null;
	}
	const awayForm = await getTeamPastMatches(matchDetails.awayTeam.id);
	const homeForm = await getTeamPastMatches(matchDetails.homeTeam.id);

	return { awayForm: awayForm?.matches, homeForm: homeForm?.matches, nextGame: matchDetails };
}

import { getDisplayScore } from "./utils";

export async function NextMatchOverviewClient({ data }: { data: Awaited<ReturnType<typeof getNextMatchData>> }) {
	const teamForms = await getTeamForms(data);
	if (!teamForms) {
		return null;
	}
	const { awayForm, homeForm, nextGame } = teamForms;
	if (!nextGame?.awayTeam.id || !nextGame?.homeTeam.id) {
		return null;
	}

	return (
		<FullBleed>
			<div className="text-slate-200 text-sm">{nextGame.status === "LIVE" ? "כרגע" : "המשחק הבא"}</div>
			<div className="flex flex-row-reverse items-center justify-center gap-2">
				<Image
					className="h-[20px]"
					width={20}
					height={20}
					src={nextGame.competition.emblem}
					alt={`${nextGame.competition.name} logo`}
				/>
				<div className="font-bold">{nextGame.competition.name}</div>
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
