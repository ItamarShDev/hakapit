<script lang="ts">
	import EpisodeCard from './EpisodeCard.svelte';
	import type { PodcastWithEpisodes, EpisodeWithPodcast } from '$lib/types/podcast';
	import type { PodcastName } from '$lib/types/podcast';

	let { data, podcast }: { data: PodcastWithEpisodes; podcast: PodcastName } = $props();

	let episodes = $derived(
		(data?.episodes ?? []).map((ep) => ({
			...ep,
			podcast: { name: podcast }
		})) as EpisodeWithPodcast[]
	);
</script>

<div class="flex flex-col gap-4 items-center">
	{#if data?.description}
		<span class="p-4 font-light info crazy-font font-display">{data.description}</span>
	{/if}
	<div class="masonry">
		{#each episodes as episode (episode._id ?? episode.guid ?? episode.episodeNumber)}
			<EpisodeCard {episode} />
		{/each}
	</div>
</div>
