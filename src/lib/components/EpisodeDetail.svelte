<script lang="ts">
	import type { Episode } from '$lib/types/podcast';

	let { data }: { data: Episode } = $props();
</script>

<section class="w-full">
	<div class="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14 lg:py-20">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
			<div class="lg:col-span-5">
				<div
					class="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-2xl"
				>
					{#if data.imageUrl}
						<img
							src={data.imageUrl}
							class="aspect-square w-full object-cover"
							alt={data?.title ?? 'episode'}
							sizes="(min-width: 1024px) 420px, 100vw"
							width="768"
							height="768"
						/>
					{:else}
						<div class="aspect-square w-full bg-black/10"></div>
					{/if}
				</div>
			</div>

			<div class="lg:col-span-7">
				<div class="rounded-3xl border border-white/10 bg-black/20 p-5 shadow-2xl sm:p-8">
					<h1
						class="text-balance text-2xl font-semibold leading-tight text-accent sm:text-3xl"
					>
						{data?.title}
					</h1>

					{#if data?.description}
						<div
							class="mt-4 max-w-none whitespace-pre-wrap break-words text-base leading-7 text-paragraph/90 sm:text-lg"
						>
							{@html data.description}
						</div>
					{/if}

					<div class="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3">
						<audio class="audio w-full" controls src={data.audioUrl}>
							<track kind="captions" />
						</audio>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
