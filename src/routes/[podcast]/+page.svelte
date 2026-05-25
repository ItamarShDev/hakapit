<script lang="ts">
	import FeedPage from '$lib/components/FeedPage.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.feed.title}</title>
	<meta name="description" content={data.feed.description || data.feed.title} />
	<meta property="og:title" content={data.feed.title} />
	<meta property="og:description" content={data.feed.description || ''} />
	{#if data.feed.imageUrl}
		<meta property="og:image" content={data.feed.imageUrl} />
	{/if}
</svelte:head>

{#if data.feed.episodes.length > 0}
	<FeedPage data={data.feed} podcast={data.podcast} />
{/if}
