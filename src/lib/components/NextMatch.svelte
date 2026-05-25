<script lang="ts">
	import { getDisplayScore } from '$lib/utils';
	import TeamAvatar from './TeamAvatar.svelte';
	import FormDisplay from './FormDisplay.svelte';
	import type { NextMatchData } from '$lib/types/soccer';

	let { nextMatchData }: { nextMatchData: NextMatchData | undefined } = $props();

	let nextGame = $derived(nextMatchData?.matchDetails);
	let awayForm = $derived(nextMatchData?.awayForm);
	let homeForm = $derived(nextMatchData?.homeForm);
</script>

{#if nextGame && awayForm && homeForm}
	<div
		class="flex flex-col gap-2 pb-6 bg-primary py-3 full-bleed font-sans"
		data-testid="next-match-overview"
	>
		<div class="flex justify-center">
			<div class="text-slate-200 text-sm">
				{nextGame.status === 'LIVE' ? 'כרגע' : 'המשחק הבא'}
			</div>
		</div>
		<div class="flex flex-row items-center justify-center gap-2">
			<div class="font-bold">{nextGame.competition.name}</div>
			<img
				class="h-5"
				width="20"
				height="20"
				src={nextGame.competition.emblem}
				alt="{nextGame.competition.name} logo"
			/>
		</div>
		<div class="game-title font-sans">
			<div class="flex flex-col items-end gap-1">
				<TeamAvatar team={nextGame.awayTeam} iconPosition="after" />
				{#if nextGame.status === 'LIVE'}
					<div class="text-xs">
						{getDisplayScore(nextGame.score, 'away')}
					</div>
				{/if}
				<div>
					<FormDisplay form={awayForm} />
				</div>
			</div>

			{#if nextGame?.utcDate}
				<div class="max-w-24 text-wrap text-xs">
					{new Date(nextGame.utcDate).toLocaleDateString()}
					{new Date(nextGame.utcDate).toLocaleTimeString()}
				</div>
			{/if}

			<div class="flex flex-col items-start gap-1">
				<TeamAvatar team={nextGame.homeTeam} iconPosition="before" />
				{#if nextGame.status === 'LIVE'}
					<div class="text-xs">
						{getDisplayScore(nextGame.score, 'home')}
					</div>
				{/if}
				<div>
					<FormDisplay form={homeForm} />
				</div>
			</div>
		</div>
	</div>
{/if}
