<script lang="ts">
	import { getContext } from 'svelte';
	import { toDateString } from '$lib/utils';
	import type { Episode, EpisodeWithPodcast } from '$lib/types/podcast';

	let { episode }: { episode: EpisodeWithPodcast } = $props();

	const player = getContext<{
		currentlyPlaying: Episode | undefined;
		isPlaying: boolean;
		setCurrentlyPlaying: (ep?: Episode) => void;
	}>('player');

	let isoDate = $derived(
		toDateString(episode?.publishedAt ? new Date(episode.publishedAt) : null)
	);
	let podcast = $derived(episode?.podcast?.name || 'hakapit');
	let episodeNumber = $derived(episode?.episodeNumber);
	let isCurrentlyPlaying = $derived(
		player?.isPlaying && player?.currentlyPlaying?.guid === episode?.guid
	);
</script>

<div class="flex items-center justify-center w-full gap-4 py-4">
	{#if player}
		<button
			class="size-10 md:size-14 lg:size-20 md:rounded-full relative p-3 overflow-hidden rounded-lg bg-primary border border-accent/20"
			onclick={() => player.setCurrentlyPlaying(episode)}
		>
			{#if episode?.imageUrl}
				<div class="absolute inset-0 overflow-hidden z-0">
					<img
						src={episode.imageUrl}
						alt="episode"
						class="min-h-full w-auto brightness-[0.4] object-cover object-top"
					/>
				</div>
			{/if}
			<div class="relative z-10">
				{#if isCurrentlyPlaying}
					<svg class="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 15 15" fill="currentColor">
						<rect x="3" y="2" width="3" height="11" />
						<rect x="9" y="2" width="3" height="11" />
					</svg>
				{:else}
					<svg class="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 15 15" fill="currentColor">
						<polygon points="4,2 13,7.5 4,13" />
					</svg>
				{/if}
			</div>
		</button>
	{/if}
	<div class="text-accent flex flex-col items-start">
		<a
			class="text-base md:text-lg lg:text-xl"
			href="/{podcast}/episodes/{episodeNumber}"
		>
			{episode?.title}
		</a>
		<div class="text-gray-400 flex items-start gap-3 text-sm">
			<div>{isoDate}</div>
		</div>
	</div>
</div>
