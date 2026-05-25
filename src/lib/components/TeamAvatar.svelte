<script lang="ts">
	import type { Team } from '$lib/types/soccer';

	let {
		team,
		iconPosition = 'before',
		color,
		hoverable = false
	}: {
		team: Team;
		iconPosition?: 'before' | 'after';
		color?: string;
		hoverable?: boolean;
	} = $props();
</script>

{#if team.id}
	{#if hoverable}
		<div
			class="size-[25px] rounded-full overflow-hidden"
			title={team.name}
		>
			<img
				src={team.crest}
				width="25"
				height="25"
				loading="lazy"
				alt={team.shortName || 'TL'}
			/>
		</div>
	{:else}
		<div
			class="flex items-center gap-3 {iconPosition === 'after'
				? 'justify-end'
				: 'justify-start'}"
		>
			{#if iconPosition === 'after'}
				<div class="text-sm md:text-lg text-amber-100" style:color>{team.name}</div>
			{/if}
			<div class="size-[25px] rounded-full overflow-hidden">
				<img
					src={team.crest}
					width="25"
					height="25"
					loading="lazy"
					alt={team.shortName || 'TL'}
				/>
			</div>
			{#if iconPosition === 'before'}
				<div class="text-sm md:text-lg text-amber-100" style:color>{team.name}</div>
			{/if}
		</div>
	{/if}
{/if}
