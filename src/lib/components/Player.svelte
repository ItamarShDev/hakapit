<script lang="ts">
	import { setContext } from 'svelte';
	import type { Episode } from '$lib/types/podcast';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let currentlyPlaying: Episode | undefined = $state(undefined);
	let isPlaying = $state(false);
	let audioEl: HTMLAudioElement | undefined = $state(undefined);

	function setCurrentlyPlaying(episode?: Episode) {
		if (episode?.audioUrl === currentlyPlaying?.audioUrl) {
			if (isPlaying) {
				audioEl?.pause();
			} else {
				audioEl?.play();
			}
			return;
		}
		audioEl?.pause();
		currentlyPlaying = episode;
		if (!audioEl) return;
		audioEl.load();
		audioEl.onloadeddata = () => {
			audioEl?.play();
		};
	}

	function closePlayer() {
		audioEl?.pause();
		currentlyPlaying = undefined;
	}

	setContext('player', {
		get currentlyPlaying() {
			return currentlyPlaying;
		},
		get isPlaying() {
			return isPlaying;
		},
		setCurrentlyPlaying
	});

	function handlePlaying() {
		isPlaying = true;
	}

	function handlePause() {
		isPlaying = false;
	}

	function handleError() {
		closePlayer();
	}
</script>

<div class={currentlyPlaying ? 'mb-36' : ''}>
	{@render children()}
</div>

<div class="bottom-0 left-0 flex flex-col w-full p-2 bg-primary {currentlyPlaying ? 'fixed z-50' : 'hidden'}">
	{#if currentlyPlaying}
		<div class="flex flex-row items-start py-2">
			{#if currentlyPlaying.imageUrl}
				<img
					src={currentlyPlaying.imageUrl}
					alt="episode"
					class="object-cover object-top w-16 h-16"
					width="64"
					height="64"
				/>
			{/if}
			<div class="flex flex-col flex-1 px-4 leading-7">
				<p class="text-lg text-white">{currentlyPlaying.title}</p>
			</div>
			<button
				onclick={closePlayer}
				class="text-white bg-transparent border-none cursor-pointer p-2 text-xl"
			>
				✕
			</button>
		</div>
		<audio
			bind:this={audioEl}
			class="audio"
			controls
			src={currentlyPlaying.audioUrl}
			onplaying={handlePlaying}
			onpause={handlePause}
			onerror={handleError}
		>
			<track kind="captions" />
		</audio>
	{/if}
</div>
