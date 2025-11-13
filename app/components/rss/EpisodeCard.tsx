"use client";

import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePlayer } from "~/components/player/provider";
import { heebo } from "~/fonts";
import { type EpisodeData, toDateString } from "~/utils";

// Remove iframes from HTML content (defensive approach for UI)
function removeIframes(content: string): string {
	if (!content) return content;

	// Remove iframe tags and their content
	return content.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "");
}

export function SkeletonCard({
	className,
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<Card
			className={cn(
				"episode-card relative max-w-xl rounded-3xl overflow-hidden bg-primary-opaque",
				className,
			)}
		>
			<CardHeader>
				<CardTitle>
					<Skeleton className="bg-primary-opaque w-64 h-6 rounded-full" />
				</CardTitle>
				<Skeleton className="bg-primary-opaque w-32 h-4 rounded-full" />
			</CardHeader>
			<CardContent>
				<Skeleton className="rounded-2xl bg-primary-opaque w-full h-32" />
			</CardContent>
		</Card>
	);
}

function PlayPauseButton({ episode }: { episode: EpisodeData }) {
	const playerProps = usePlayer();
	if (!playerProps) return null;
	if (
		playerProps.isPlaying &&
		playerProps.currentlyPlaying?.guid === episode?.guid
	)
		return <PauseIcon className="size-7 md:size-4 z-10" />;
	return <PlayIcon className="size-7 md:size-4 z-10" />;
}

export function LastEpisodeCardPreview({ episode }: { episode: EpisodeData }) {
	const isoDate = toDateString(
		episode?.publishedAt ? new Date(episode.publishedAt) : null,
	);
	const playerProps = usePlayer();
	return (
		<div className="flex items-center justify-center w-full gap-4 py-4">
			{playerProps && (
				<Button
					className="md:size-14 size-20 md:rounded-full relative p-3 overflow-hidden"
					onClick={() => playerProps.setCurrentlyPlaying(episode as any)}
				>
					{episode?.imageUrl && (
						<Image
							src={episode?.imageUrl}
							alt="episode"
							priority={true}
							sizes="(min-width: 768px) 56px, 80px"
							fill={true}
							className=" brightness-40 filter z-0 absolute object-cover object-top"
						/>
					)}
					<PlayPauseButton episode={episode} />
				</Button>
			)}
			<div className="text-accent flex flex-col items-start">
				<Link
					prefetch={true}
					className="md:text-lg text-xl"
					href={`/${(episode as any)?.podcast?.name || "hakapit"}/episodes/${episode?.episodeNumber}`}
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
	episode?: EpisodeData;
	contentClassName?: React.HTMLAttributes<HTMLDivElement>["className"];
} & React.HTMLAttributes<HTMLDivElement>) {
	const isoDate = toDateString(
		episode?.publishedAt ? new Date(episode.publishedAt) : null,
	);
	const playerProps = usePlayer();
	return (
		<Card
			className={cn(
				"episode-card relative max-w-xl rounded-3xl overflow-hidden",
				className,
				heebo.className,
			)}
		>
			{episode?.imageUrl && (
				<Image
					src={episode?.imageUrl}
					alt="episode"
					fill={true}
					loading="eager"
					priority={true}
					sizes="576px"
					className="rounded-3xl brightness-40 filter blur-xs absolute z-0 object-cover object-top"
				/>
			)}
			<CardHeader className="z-10">
				<CardTitle className="text-accent">
					<Link
						href={`/${(episode as any)?.podcast?.name || "hakapit"}/episodes/${episode?.episodeNumber}`}
					>
						{episode?.title}
					</Link>
				</CardTitle>
				<CardDescription className="text-muted">{isoDate}</CardDescription>
			</CardHeader>
			<CardContent
				className={cn("flex-1 text-paragraph z-10", contentClassName)}
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
						onClick={() => playerProps.setCurrentlyPlaying(episode as any)}
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
