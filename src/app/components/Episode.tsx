import { Image } from "@unpic/react";
import type { Doc } from "convex/_generated/dataModel";

export default function Episode({ data }: { data: Doc<"episodes"> }) {
	const viewTransitionKey = data?.guid
		? String(data.guid)
		: data?.episodeNumber != null
			? String(data.episodeNumber)
			: "";
	return (
		<section className="w-full">
			<div className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14 lg:py-20">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
					<div className="lg:col-span-5">
						<div
							className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-2xl"
							style={viewTransitionKey ? { viewTransitionName: `episode-image-${viewTransitionKey}` } : undefined}
						>
							{data.imageUrl ? (
								<Image
									src={data.imageUrl}
									className="aspect-square w-full object-cover"
									alt={data?.title ?? "episode"}
									sizes="(min-width: 1024px) 420px, 100vw"
									width={768}
									height={768}
								/>
							) : (
								<div className="aspect-square w-full bg-black/10" />
							)}
						</div>
					</div>

					<div className="lg:col-span-7">
						<div className="rounded-3xl border border-white/10 bg-black/20 p-5 shadow-2xl sm:p-8">
							<h1
								className="text-balance text-2xl font-semibold leading-tight text-accent sm:text-3xl"
								style={viewTransitionKey ? { viewTransitionName: `episode-title-${viewTransitionKey}` } : undefined}
							>
								{data?.title}
							</h1>

							{data?.description ? (
								<div
									className="mt-4 max-w-none whitespace-pre-wrap wrap-break-word text-base leading-7 text-paragraph/90 sm:text-lg"
									/* biome-ignore lint: noDangerouslySetInnerHtml */
									dangerouslySetInnerHTML={{
										__html: data.description || "",
									}}
								/>
							) : null}

							<div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3">
								<audio className="audio w-full" controls src={data.audioUrl}>
									<track kind="captions" />
								</audio>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
