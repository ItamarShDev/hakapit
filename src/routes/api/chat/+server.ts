import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

interface ChatMessage {
	role: string;
	parts?: Array<{ type: string; content?: string }>;
	content?: string;
}

function extractContent(msg: ChatMessage): string {
	if (msg.parts && msg.parts.length > 0) {
		return msg.parts
			.filter((p) => p.type === 'text' && p.content)
			.map((p) => p.content!)
			.join('');
	}
	return msg.content || '';
}

export const POST: RequestHandler = async ({ request }) => {
	const GOOGLE_GENERATIVE_AI_API_KEY = env.GOOGLE_GENERATIVE_AI_API_KEY;
	if (!GOOGLE_GENERATIVE_AI_API_KEY) {
		return json({ error: 'GOOGLE_GENERATIVE_AI_API_KEY not configured' }, { status: 500 });
	}

	try {
		const body = await request.json();
		const messages: ChatMessage[] = body.messages || [];

		const validMessages = messages
			.map((m) => ({ role: m.role, content: extractContent(m) }))
			.filter((m) => m.content.length > 0);

		const userMessages = validMessages.filter((m) => m.role === 'user');
		const lastAssistant = validMessages.filter((m) => m.role === 'assistant').at(-1);
		const minimalMessages = [
			...(lastAssistant ? [lastAssistant] : []),
			...userMessages
		];

		const geminiMessages = minimalMessages.map((m) => ({
			role: m.role === 'assistant' ? 'model' : 'user',
			parts: [{ text: m.content }]
		}));

		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_GENERATIVE_AI_API_KEY}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					contents: geminiMessages,
					systemInstruction: {
						parts: [
							{
								text: `You are a Liverpool FC expert. Keep responses short and factual. Current year: ${new Date().getFullYear()}.`
							}
						]
					},
					tools: [{ googleSearch: {} }]
				})
			}
		);

		if (!response.ok) {
			const errorBody = await response.text();
			console.error('Gemini API error:', errorBody);
			return json({ error: 'AI service error' }, { status: 502 });
		}

		const data = await response.json();
		const content =
			data.candidates?.[0]?.content?.parts
				?.map((p: { text?: string }) => p.text || '')
				.join('') || '';

		return json({ content });
	} catch (err) {
		console.error('Chat API error:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
