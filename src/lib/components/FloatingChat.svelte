<script lang="ts">
	import { marked } from 'marked';
	import { getDirectionFromText } from '$lib/utils';

	interface ChatMessage {
		id: string;
		role: 'user' | 'assistant';
		content: string;
	}

	let open = $state(false);
	let input = $state('');
	let messages = $state<ChatMessage[]>([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let contentEl: HTMLDivElement | undefined = $state(undefined);
	let inputEl: HTMLTextAreaElement | undefined = $state(undefined);

	let inputDir = $derived(getDirectionFromText(input));

	async function sendMessage() {
		if (!input.trim() || isLoading) return;
		const currentInput = input;
		input = '';
		error = null;

		const userMsg: ChatMessage = {
			id: crypto.randomUUID(),
			role: 'user',
			content: currentInput
		};
		messages = [...messages, userMsg];

		isLoading = true;

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: messages.map((m) => ({
						role: m.role,
						parts: [{ type: 'text', content: m.content }]
					}))
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.json();
			const assistantMsg: ChatMessage = {
				id: crypto.randomUUID(),
				role: 'assistant',
				content: data.content || 'אין תשובה'
			};
			messages = [...messages, assistantMsg];
		} catch (err) {
			error = err instanceof Error ? err.message : 'שגיאה לא ידועה';
			input = currentInput;
		} finally {
			isLoading = false;
			scrollToBottom();
		}
	}

	function scrollToBottom() {
		setTimeout(() => {
			if (contentEl) {
				contentEl.scrollTop = contentEl.scrollHeight;
			}
		}, 50);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	$effect(() => {
		if (open && inputEl) {
			setTimeout(() => inputEl?.focus(), 100);
		}
	});
</script>

<div
	data-testid="floating-chat"
	class="fixed bottom-4 left-4 z-50"
>
	{#if !open}
		<button
			data-testid="chat-trigger-button"
			class="px-6 py-3 rounded-full bg-primary text-accent border border-accent/20 hover:bg-accent hover:text-primary transition font-medium shadow-lg"
			onclick={() => (open = true)}
		>
			שאל אותי על ליברפול
		</button>
	{:else}
		<div class="w-[380px] max-h-[500px] bg-popover border border-accent/20 rounded-xl shadow-2xl flex flex-col overflow-hidden">
			<div dir="rtl" class="flex items-center justify-between border-b border-slate-600 p-3">
				<span data-testid="chat-title" class="text-accent font-bold">Liver-Chat</span>
				<button
					onclick={() => (open = false)}
					class="text-accent hover:text-accent/80 bg-transparent border-none cursor-pointer text-lg"
					aria-label="סגור"
				>
					✕
				</button>
			</div>
			<p data-testid="chat-description" dir="rtl" class="text-sm text-gray-400 px-3 py-1">
				ניתן לשאול כל שאלה לגבי הקבוצה, בכל שפה
			</p>

			<div bind:this={contentEl} data-testid="chat-messages" class="flex-1 px-4 overflow-y-auto text-paragraph min-h-[200px]">
				{#each messages as message (message.id)}
					{#if message.role === 'user'}
						{@const dir = getDirectionFromText(message.content)}
						<div class="flex items-center gap-2 text-accent py-4 sticky top-0 bg-popover" {dir}>
							{message.content}
							{#if isLoading && message === messages.filter((m) => m.role === 'user').at(-1)}
								<img class="grayscale h-8 w-8" src="/liverpool-animation.gif" alt="loading" width="30" height="30" />
							{/if}
						</div>
					{:else if message.role === 'assistant'}
						{@const dir = getDirectionFromText(message.content)}
						<div class="py-2 text-sm whitespace-pre-wrap" {dir}>
							{@html marked(message.content)}
						</div>
					{/if}
				{/each}
			</div>

			{#if error}
				<div class="text-red-500 text-sm text-center px-4 py-2" dir="rtl">
					שגיאה: {error}
					<button
						onclick={() => {
							const lastUser = messages.filter((m) => m.role === 'user').at(-1);
							if (lastUser) {
								input = lastUser.content;
								messages = messages.filter((m) => m.id !== lastUser.id);
								sendMessage();
							}
						}}
						class="text-accent hover:text-accent/80 bg-transparent border-none cursor-pointer underline ml-2"
					>
						נסה שוב
					</button>
				</div>
			{/if}

			<div class="p-2 flex flex-row border-t border-slate-600 items-center">
				<button
					data-testid="chat-send-button"
					onclick={sendMessage}
					disabled={isLoading}
					class="bg-transparent border-none cursor-pointer p-2 text-yellow-400 disabled:opacity-50"
					aria-label="שלח הודעה"
				>
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 10 4 15 9 20" />
						<path d="M20 4v7a4 4 0 0 1-4 4H4" />
					</svg>
				</button>
				<textarea
					data-testid="chat-input"
					bind:this={inputEl}
					bind:value={input}
					onkeydown={handleKeyDown}
					placeholder="הקלד שאלה..."
					dir={inputDir}
					class="flex-1 border-0 text-accent bg-transparent resize-none p-2 outline-none {inputDir === 'ltr' ? 'text-left' : 'text-right'}"
					disabled={isLoading}
					rows="1"
				></textarea>
			</div>
		</div>
	{/if}
</div>
