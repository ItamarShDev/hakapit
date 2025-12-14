import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$podcast/episodes/")({
	loader: async ({ params }) => {
		const validPodcasts = ["hakapit", "nitk", "balcony-albums"];
		if (!params.podcast || !validPodcasts.includes(params.podcast)) {
			throw new Error("Invalid podcast parameter");
		}
		const podcastName = params.podcast as "hakapit" | "nitk" | "balcony-albums";
		throw redirect({ to: "/$podcast", params: { podcast: podcastName } });
	},
});
