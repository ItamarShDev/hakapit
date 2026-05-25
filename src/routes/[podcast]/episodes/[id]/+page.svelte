<script lang="ts">
	import EpisodeDetail from '$lib/components/EpisodeDetail.svelte';

	let { data } = $props();
</script>

<svelte:head>
	{#if data.episode}
		<title>{data.episode.title}</title>
		<meta name="description" content={data.episode.description?.replace(/\n/g, ' ') || ''} />
		<meta property="og:title" content={data.episode.title} />
		<meta property="og:description" content={data.episode.description || ''} />
		{#if data.episode.imageUrl}
			<meta property="og:image" content={data.episode.imageUrl} />
		{/if}
	{:else}
		<title>{data.podcast}</title>
	{/if}
</svelte:head>

{#if data.episode}
	<EpisodeDetail data={data.episode} />
{:else}
	<div class="text-center py-10 text-paragraph">
		<p>הפרק לא נמצא</p>
	</div>
{/if}
