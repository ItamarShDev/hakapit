"use client";
import { useCallback, useState } from "react";

interface AnswerStreamChunk {
	content: string;
	citations: { url: string }[];
}

export function useChat() {
	const [answer, setAnswer] = useState<string>("");
	const [citations, setCitations] = useState<AnswerStreamChunk["citations"]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const streamAnswer = useCallback(async (query: string) => {
		// Reset state
		setAnswer("");
		setCitations([]);
		setError(null);
		setIsLoading(true);

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query }),
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error("Failed to get reader");
			}

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n\n");

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						try {
							const data: AnswerStreamChunk = JSON.parse(line.substring(6));

							if (data.content) {
								setAnswer((prev) => prev + data.content);
							}

							if (data.citations && data.citations.length > 0) {
								setCitations((prev) => {
									// Filter out duplicates by URL
									const newCitations = data.citations.filter((citation) => !prev.some((c) => c.url === citation.url));

									return [...prev, ...newCitations];
								});
							}
						} catch (e) {
							console.error("Error parsing stream data:", e);
						}
					}
				}
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			}
			console.error("Stream error:", err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	return {
		answer,
		citations,
		isLoading,
		error,
		streamAnswer,
		reset: () => {
			setAnswer("");
			setCitations([]);
			setError(null);
		},
	};
}
