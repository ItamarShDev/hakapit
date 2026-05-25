<script lang="ts">
	import { LiverpoolId } from '$lib/types/soccer';
	import type { Match } from '$lib/types/soccer';

	let { form }: { form?: Match[] } = $props();

	function resultToString(match: Match) {
		const isHome = match.homeTeam.id === LiverpoolId;
		const isWon = isHome
			? match.score.winner === 'HOME_TEAM'
			: match.score.winner === 'AWAY_TEAM';
		if (match.score.winner === 'DRAW') return 'D';
		if (isWon) return 'W';
		return 'L';
	}

	function getFormColor(match: Match) {
		const isHome = match.homeTeam.id === LiverpoolId;
		const isWon = isHome
			? match.score.winner === 'HOME_TEAM'
			: match.score.winner === 'AWAY_TEAM';
		if (match.score.winner === 'DRAW') return 'bg-slate-400';
		if (isWon) return 'bg-green-400';
		return 'bg-red-400';
	}
</script>

{#if form}
	<div class="flex gap-1">
		{#each form as game (game.id)}
			<div
				class="h-[25px] w-[25px] rounded-full flex items-center justify-center text-xs font-bold {getFormColor(game)}"
				title="{game.homeTeam.name} vs {game.awayTeam.name}"
			>
				{resultToString(game)}
			</div>
		{/each}
	</div>
{/if}
