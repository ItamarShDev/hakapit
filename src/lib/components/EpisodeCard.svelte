<script lang="ts">
	import { getContext } from 'svelte';
	import { toDateString, removeIframes } from '$lib/utils';
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

<div
	class="episode-card relative max-w-xl max-h-[450px] rounded-3xl overflow-hidden flex flex-col font-sans"
>
	{#if episode?.imageUrl}
		<div class="absolute inset-0 overflow-hidden rounded-3xl z-0">
			<img
				src={episode.imageUrl}
				alt="episode"
				loading="eager"
				class="min-h-full w-full brightness-[0.4] object-cover object-top blur-[2px]"
			/>
		</div>
	{/if}
	<div class="z-10 p-4">
		<h3 class="text-accent font-semibold">
			<a href="/{podcast}/episodes/{episodeNumber}">
				{episode?.title}
			</a>
		</h3>
		<p class="text-gray-400 text-sm">{isoDate}</p>
	</div>
	<div class="flex-1 min-h-0 text-paragraph z-10 overflow-hidden p-4 pt-0">
		{#if episode?.htmlDescription}
			<div class="card-content">
				{@html removeIframes(episode.htmlDescription)}
			</div>
		{/if}
	</div>
	<div class="mt-auto p-4 z-10">
		{#if player}
			<button
				disabled={isCurrentlyPlaying}
				class="w-full px-4 py-2 rounded-lg bg-primary text-accent border border-accent/20 hover:bg-primary/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
				onclick={() => player.setCurrentlyPlaying(episode)}
			>
				{isCurrentlyPlaying ? 'מנגן כרגע' : 'נגן פרק'}
			</button>
		{:else}
			<audio class="audio" controls src={episode?.audioUrl}>
				<track kind="captions" />
			</audio>
		{/if}
	</div>
</div>
