import { updateFeedsInDb } from "~/server/rss/feed";

export const dynamic = "force-dynamic";
export async function GET() {
	const insertResult = await updateFeedsInDb();
	if (insertResult) {
		return new Response("Feed updated", {
			status: 200,
			headers: {
				"Content-Type": "text/plain",
			},
		});
	}
	return new Response("Feed not updated", {
		status: 304,
		headers: {
			"Content-Type": "text/plain",
		},
	});
}
