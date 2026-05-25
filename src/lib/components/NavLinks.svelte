<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils';

	let { class: className = '', onselect }: { class?: string; onselect?: () => void } = $props();

	const links = [
		{ href: '/', label: 'בית' },
		{ href: '/hakapit', label: 'הכפית' },
		{ href: '/nitk', label: 'שכונה בממלכה' },
		{ href: '/balcony-albums', label: 'אלבומים במרפסת' }
	];
</script>

<nav class={cn('gap-2 lg:gap-4 links text-1xl overflow-hidden', className)}>
	{#each links as link, index}
		<a
			href={link.href}
			class={cn(page.url.pathname === link.href && 'underline')}
			onclick={onselect}
		>
			{link.label}
		</a>
		{#if index !== links.length - 1}
			<span class="text-accent lg:inline-block hidden">|</span>
		{/if}
	{/each}
</nav>
