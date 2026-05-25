<script lang="ts">
	import type { Transfer } from '$lib/types/soccer';
	import { cn } from '$lib/utils';

	let { transfers }: { transfers: Transfer[] | null } = $props();

	let openTransferId = $state<string | null>(null);

	let sortedTransfers = $derived(
		transfers
			?.slice()
			.sort((a, b) => {
				const dateA = a.date ? new Date(a.date).getTime() : 0;
				const dateB = b.date ? new Date(b.date).getTime() : 0;
				return dateB - dateA;
			}) ?? []
	);

	let inTransfers = $derived(sortedTransfers.filter((t) => t.direction === 'IN'));
	let outTransfers = $derived(sortedTransfers.filter((t) => t.direction === 'OUT'));
</script>

{#if transfers && transfers.length > 0}
	<div class="flex flex-col gap-4 items-center">
		<div class="flex items-center gap-4">
			<h2 data-testid="recent-transfers-title">העברות אחרונות</h2>
		</div>

		{#if inTransfers.length > 0}
			<div class="flex flex-col gap-2 items-center">
				<div class="text-sm font-semibold text-green-600 mb-1">העברות פנימה (IN)</div>
				<ul class="avatar-grid list-none">
					{#each inTransfers as transfer (transfer._id)}
						<li
							class={cn(
								'aspect-square w-full h-auto relative',
								openTransferId && openTransferId !== transfer._id ? 'opacity-30' : ''
							)}
						>
							<button
								class="w-full bg-transparent border-none cursor-pointer p-0"
								onclick={() =>
									(openTransferId = openTransferId === transfer._id ? null : transfer._id)}
							>
								<img
									src={transfer.playerPhoto ?? ''}
									loading="lazy"
									class="object-cover w-full h-full rounded-full aspect-square"
									alt={transfer.playerName}
								/>
							</button>
							{#if openTransferId === transfer._id}
								<div
									class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-popover border border-accent/20 rounded-xl shadow-lg p-4 z-50 text-paragraph"
									dir="rtl"
								>
									<div class="flex items-center gap-3 mb-3">
										<img
											src={transfer.playerPhoto ?? ''}
											loading="lazy"
											class="object-cover w-14 h-14 rounded-full"
											alt={transfer.playerName}
										/>
										<div>
											<div class="text-lg font-bold">{transfer.playerName}</div>
											<div class="flex gap-1 mt-1">
												<span class="text-xs px-2 py-1 rounded-full font-medium bg-green-500 text-white">IN</span>
												{#if transfer.action}
													<span class="text-xs px-2 py-1 rounded-full font-medium {transfer.action === 'BUY' ? 'bg-blue-500' : 'bg-orange-500'} text-white">
														{transfer.action}
													</span>
												{/if}
											</div>
										</div>
									</div>
									{#if transfer.price}
										<div class="flex justify-between text-sm mb-1">
											<span class="text-gray-400">דמי העברה</span>
											<span class="font-semibold text-yellow-600">{transfer.price}</span>
										</div>
									{/if}
									<div class="flex justify-between text-sm mb-1">
										<span class="text-gray-400">תאריך</span>
										<span>{transfer.date ? new Date(transfer.date).toLocaleDateString() : 'לא ידוע'}</span>
									</div>
									<div class="flex justify-between text-sm">
										<span class="text-gray-400">קבוצה</span>
										<span>{transfer.teamName}</span>
									</div>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if outTransfers.length > 0}
			<div class="flex flex-col gap-2 items-center">
				<div class="text-sm font-semibold text-red-600 mb-1">העברות חוצה (OUT)</div>
				<ul class="avatar-grid list-none">
					{#each outTransfers as transfer (transfer._id)}
						<li
							class={cn(
								'aspect-square w-full h-auto relative',
								openTransferId && openTransferId !== transfer._id ? 'opacity-30' : ''
							)}
						>
							<button
								class="w-full bg-transparent border-none cursor-pointer p-0"
								onclick={() =>
									(openTransferId = openTransferId === transfer._id ? null : transfer._id)}
							>
								<img
									src={transfer.playerPhoto ?? ''}
									loading="lazy"
									class="object-cover w-full h-full rounded-full aspect-square"
									alt={transfer.playerName}
								/>
							</button>
							{#if openTransferId === transfer._id}
								<div
									class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-popover border border-accent/20 rounded-xl shadow-lg p-4 z-50 text-paragraph"
									dir="rtl"
								>
									<div class="flex items-center gap-3 mb-3">
										<img
											src={transfer.playerPhoto ?? ''}
											loading="lazy"
											class="object-cover w-14 h-14 rounded-full"
											alt={transfer.playerName}
										/>
										<div>
											<div class="text-lg font-bold">{transfer.playerName}</div>
											<div class="flex gap-1 mt-1">
												<span class="text-xs px-2 py-1 rounded-full font-medium bg-red-500 text-white">OUT</span>
												{#if transfer.action}
													<span class="text-xs px-2 py-1 rounded-full font-medium {transfer.action === 'BUY' ? 'bg-blue-500' : 'bg-orange-500'} text-white">
														{transfer.action}
													</span>
												{/if}
											</div>
										</div>
									</div>
									{#if transfer.price}
										<div class="flex justify-between text-sm mb-1">
											<span class="text-gray-400">דמי העברה</span>
											<span class="font-semibold text-yellow-600">{transfer.price}</span>
										</div>
									{/if}
									<div class="flex justify-between text-sm mb-1">
										<span class="text-gray-400">תאריך</span>
										<span>{transfer.date ? new Date(transfer.date).toLocaleDateString() : 'לא ידוע'}</span>
									</div>
									<div class="flex justify-between text-sm">
										<span class="text-gray-400">קבוצה</span>
										<span>{transfer.teamName}</span>
									</div>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{/if}
