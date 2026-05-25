<script lang="ts">
	import NavLinks from './NavLinks.svelte';

	let { data }: { data: { imageUrl: string; title: string } } = $props();
	let menuOpen = $state(false);
</script>

<header class="header overflow-hidden">
	<div class="lg:items-center flex flex-wrap items-start gap-4 p-4">
		<div class="header-image">
			{#if data.imageUrl}
				<img
					src={data.imageUrl}
					alt="podcast logo"
					class="object-contain"
					width="48"
					height="48"
					loading="lazy"
					decoding="async"
				/>
			{/if}
		</div>
		<div class="flex-1 header-title flex gap-3 items-baseline font-heading">
			<a href="/">
				<h1>{data.title}</h1>
			</a>
		</div>
		<div class="lg:gap-4 lg:hidden flex flex-col flex-wrap items-end gap-2 pt-2">
			<button onclick={() => (menuOpen = !menuOpen)} class="menu-button bg-transparent border-none cursor-pointer p-2">
				<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 50 50">
					<title>Menu</title>
					<path
						class="fill-paragraph"
						d="M 0 9 L 0 11 L 50 11 L 50 9 Z M 0 24 L 0 26 L 50 26 L 50 24 Z M 0 39 L 0 41 L 50 41 L 50 39 Z"
					/>
				</svg>
			</button>
		</div>
		<NavLinks class="lg:flex flex-row hidden" />
	</div>
	<div class="grid-transition header-links grid items-start {menuOpen ? 'show-menu mb-4' : 'hide-menu'}">
		<NavLinks class="flex flex-col items-center text-2xl" onselect={() => (menuOpen = false)} />
	</div>
</header>
