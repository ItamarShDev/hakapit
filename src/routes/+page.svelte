<script lang="ts">
	import Trophies from '$lib/components/Trophies.svelte';
	import NextMatch from '$lib/components/NextMatch.svelte';
	import StatsTable from '$lib/components/StatsTable.svelte';
	import FloatingChat from '$lib/components/FloatingChat.svelte';

	let { data } = $props();

	let leaguesData = $derived(data.snapshot?.leaguesData ?? []);
	let nextMatchData = $derived(data.snapshot?.nextMatchData ?? undefined);
</script>

<svelte:head>
	<title>הכפית</title>
	<meta name="description" content="דף הבית של משפחת הכפית" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://hakapit.online/" />
	<meta property="og:title" content="הכפית" />
	<meta property="og:description" content="דף הבית של משפחת הכפית" />
	<meta property="og:image" content="https://hakapit.online/icon-512x512.png" />
</svelte:head>

<section class="lg:about lg:py-0 flex flex-col items-center justify-center h-full py-4 text-center">
	<div class="flex flex-col w-full gap-10">
		<Trophies />

		<NextMatch {nextMatchData} />

		<StatsTable {leaguesData} />
	</div>
	<FloatingChat />
</section>
