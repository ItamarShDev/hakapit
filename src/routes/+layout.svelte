<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Player from '$lib/components/Player.svelte';
	import { page } from '$app/state';
	import { PODCAST_META, validatePodcastParam } from '$lib/types/podcast';
	import type { PodcastName } from '$lib/types/podcast';

	let { children } = $props();

	let podcast = $derived(
		(() => {
			const p = page.params?.podcast;
			return p && validatePodcastParam(p) ? (p as PodcastName) : 'hakapit';
		})()
	);

	let podcastData = $derived(PODCAST_META[podcast]);
</script>

<svelte:head>
	<title>הכפית</title>
	<meta name="description" content="אתר הבית של משפחת הכפית" />
	<meta name="author" content="משפחת הכפית" />
	<meta name="color-scheme" content="dark light" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://hakapit.online" />
	<meta property="og:title" content="הכפית" />
	<meta property="og:description" content="אתר הבית של משפחת הכפית" />
	<meta property="og:image" content="https://hakapit.online/logo.webp" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="הכפית" />
	<meta name="twitter:description" content="אתר הבית של משפחת הכפית" />
	<meta name="twitter:image" content="https://hakapit.online/logo.webp" />
</svelte:head>

<div class={podcast}>
	<div class="body">
		<Header data={podcastData} />
		<div class="main-content">
			<Player>
				{@render children()}
			</Player>
		</div>
		<Footer />
	</div>
</div>
