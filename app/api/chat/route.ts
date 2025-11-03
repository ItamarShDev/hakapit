import { google } from "@ai-sdk/google";
import { streamText } from "ai";

function errorHandler(error: unknown) {
	if (error == null) {
		return "unknown error";
	}

	if (typeof error === "string") {
		return error;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return JSON.stringify(error);
}

export async function POST(req: Request) {
	const { messages } = await req.json();
	const result = streamText({
		model: google("gemini-2.5-flash", {
			useSearchGrounding: true,
		}),
		messages,
		system: `You are a Liverpool FC expert. always search the web to find the answer. do not provide any additional information. keep it short and sweet. unless said otherwise the year asked about is ${new Date().getFullYear()}. Verify the information you provide is correct.`,
	});

	return result.toDataStreamResponse({
		getErrorMessage: errorHandler,
	});
}
