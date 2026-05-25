<script lang="ts">
	const trophies = [
		{ tournamentId: 42, name: 'Champions League', won: 6 },
		{ tournamentId: 47, name: 'Premier League', won: 19 },
		{ tournamentId: 132, name: 'FA Cup', won: 8 },
		{ tournamentId: 133, name: 'EFL Cup', won: 10 },
		{ tournamentId: 73, name: 'Europa League', won: 3 },
		{ tournamentId: 74, name: 'UEFA Super Cup', won: 4 },
		{ tournamentId: 247, name: 'Community Shield', won: 16 },
		{ tournamentId: 48, name: 'Championship', won: 4 }
	];

	let loadedImages = $state(new Set<number>());

	function handleImageLoad(tournamentId: number) {
		loadedImages = new Set(loadedImages).add(tournamentId);
	}
</script>

<div data-testid="trophies-section" class="avatar-grid">
	{#each trophies as trophy (trophy.tournamentId)}
		<div class="text-center">
			<div class="aspect-square w-full h-auto" data-testid="trophy-{trophy.tournamentId}">
				<img
					alt={trophy.name}
					src="https://images.fotmob.com/image_resources/logo/leaguelogo/dark/{trophy.tournamentId}.png"
					loading="lazy"
					decoding="async"
					class="object-contain w-full h-full rounded-full"
					sizes="64px"
					title={trophy.name}
					onload={() => handleImageLoad(trophy.tournamentId)}
				/>
			</div>
			{#if loadedImages.has(trophy.tournamentId)}
				<div class="text-sm text-gray-100">{trophy.won}</div>
			{/if}
		</div>
	{/each}
</div>
