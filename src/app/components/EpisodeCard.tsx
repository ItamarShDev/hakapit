import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Button } from "~/@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/@/components/ui/card";
import { cn } from "~/@/lib/utils";
import { heebo } from "~/app/fonts";
import { usePlayer } from "~/app/layouts/Player/provider";
import { type EpisodeWithPodcast, toDateString } from "~/app/utils";

// Remove iframes from HTML content (defensive approach for UI)
function removeIframes(content: string): string {
	if (!content) return content;

	// Remove iframe tags and their content
	return content.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "");
}

function PlayPauseButton({ episode }: { episode: EpisodeWithPodcast }) {
	const playerProps = usePlayer();
	if (!playerProps) return null;
	if (playerProps.isPlaying && playerProps.currentlyPlaying?.guid === episode?.guid)
		return <PauseIcon className="size-7 md:size-4 z-10" />;
	return <PlayIcon className="size-7 md:size-4 z-10" />;
}

export function LastEpisodeCardPreview({ episode }: { episode: EpisodeWithPodcast }) {
	const isoDate = toDateString(episode?.publishedAt ? new Date(episode.publishedAt) : null);
	const playerProps = usePlayer();
	const podcast = episode?.podcast?.name || "hakapit";
	const episodeNumber = episode?.episodeNumber;

	return (
		<div className="flex items-center justify-center w-full gap-4 py-4">
			{playerProps && (
				<Button
					className="md:size-14 size-20 md:rounded-full relative p-3 overflow-hidden"
					onClick={() => playerProps.setCurrentlyPlaying(episode)}
				>
					{episode?.imageUrl && (
						<div className="absolute inset-0 overflow-hidden z-0">
							<Image
								src={episode?.imageUrl}
								alt="episode"
								sizes="(min-width: 768px) 56px, 80px"
								className="min-h-full w-auto brightness-40 filter object-cover object-top"
								layout="fullWidth"
							/>
						</div>
					)}
					<PlayPauseButton episode={episode} />
				</Button>
			)}
			<div className="text-accent flex flex-col items-start">
				<Link
					preload="intent"
					className="md:text-lg text-xl"
					to="/$podcast/episodes/$id"
					params={{ podcast, id: String(episodeNumber) }}
				>
					{episode?.title}
				</Link>
				<div className="text-muted flex items-start gap-3 text-sm">
					<div className="">{isoDate}</div>
				</div>
			</div>
		</div>
	);
}

export function EpisodeCard({
	episode,
	className,
	contentClassName,
}: {
	episode?: EpisodeWithPodcast;
	contentClassName?: React.HTMLAttributes<HTMLDivElement>["className"];
} & React.HTMLAttributes<HTMLDivElement>) {
	const isoDate = toDateString(episode?.publishedAt ? new Date(episode.publishedAt) : null);
	const playerProps = usePlayer();
	const podcast = episode?.podcast?.name || "hakapit";
	const episodeNumber = episode?.episodeNumber;
	const viewTransitionKey = episode?.guid ? String(episode.guid) : episodeNumber != null ? String(episodeNumber) : "";

	return (
		<Card className={cn("episode-card relative max-w-xl rounded-3xl overflow-hidden", className, heebo.className)}>
			{episode?.imageUrl && (
				<div className="absolute inset-0 overflow-hidden rounded-3xl z-0">
					<Image
						src={episode?.imageUrl}
						alt="episode"
						loading="eager"
						sizes="576px"
						className="min-h-full w-auto brightness-40 filter blur-xs object-cover object-top"
						layout="fullWidth"
					/>
				</div>
			)}
			<CardHeader className="z-10">
				<CardTitle className="text-accent">
					<Link
						to="/$podcast/episodes/$id"
						params={{ podcast, id: String(episodeNumber) }}
						style={viewTransitionKey ? { viewTransitionName: `episode-title-${viewTransitionKey}` } : undefined}
					>
						{episode?.title}
					</Link>
				</CardTitle>
				<CardDescription className="text-muted">{isoDate}</CardDescription>
			</CardHeader>
			<CardContent
				style={viewTransitionKey ? { viewTransitionName: `episode-content-${viewTransitionKey}` } : undefined}
				className={cn("flex-1 text-paragraph z-10 max-h-full", contentClassName)}
			>
				{episode?.htmlDescription && (
					<div
						className="card-content"
						// biome-ignore lint: noDangerouslySetInnerHtml
						dangerouslySetInnerHTML={{
							__html: removeIframes(episode?.htmlDescription),
						}}
					/>
				)}
			</CardContent>
			<CardFooter>
				{playerProps ? (
					<Button
						disabled={playerProps.currentlyPlaying?.guid === episode?.guid}
						className="z-10 w-full"
						onClick={() => playerProps.setCurrentlyPlaying(episode)}
					>
						{playerProps.currentlyPlaying?.guid === episode?.guid ? (
							"מנגן כרגע"
						) : (
							<>
								נגן פרק <PlayIcon className="ms-4" />
							</>
						)}
					</Button>
				) : (
					<audio className="audio" controls src={episode?.audioUrl}>
						<track kind="captions" />
					</audio>
				)}
			</CardFooter>
		</Card>
	);
}
