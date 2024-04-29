"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PlayIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { usePlayer } from "~/components/player/provider";
import { toDateString, type EpisodeData } from "~/utils";

export function SkeletonCard({ className }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<Card className={cn("episode-card h-full w-full max-w-xl rounded-3xl", className)}>
			<CardHeader>
				<CardTitle>
					<Skeleton className="w-64 h-6 rounded-full bg-primary-opaque" />
				</CardTitle>
				<CardDescription>
					<Skeleton className="w-32 h-4 rounded-full bg-primary-opaque" />
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Skeleton className="w-full h-32 rounded-2xl bg-primary-opaque" />
			</CardContent>
		</Card>
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
	const isoDate = toDateString(episode?.publishedAt);
	const playerProps = usePlayer();

	return (
		<Card className={cn("episode-card relative max-w-xl rounded-3xl overflow-hidden", className)}>
			{episode?.imageUrl && (
				<Image
					src={episode?.imageUrl}
					alt="episode"
					fill={true}
					loading="eager"
					objectFit="cover"
					className="absolute object-cover object-top z-0 rounded-3xl brightness-40 filter"
				/>
			)}
			<CardHeader className="z-10">
				<CardTitle className="text-accent">
					<Link href={`/${episode?.podcast?.name}/episodes/${episode?.episodeNumber}`}>{episode?.title}</Link>
				</CardTitle>
				<CardDescription className="text-muted">{isoDate}</CardDescription>
			</CardHeader>
			<CardContent className={cn("flex-1 text-paragraph z-10", contentClassName)}>
				{episode?.htmlDescription && (
					<div
						className="card-content"
						// biome-ignore lint: noDangerouslySetInnerHtml
						dangerouslySetInnerHTML={{
							__html: episode?.htmlDescription,
						}}
					/>
				)}
			</CardContent>
			<CardFooter>
				{playerProps ? (
					<Button
						disabled={playerProps.currentlyPlaying?.guid === episode?.guid}
						className="w-full z-10"
						onClick={() => playerProps.setCurrentlyPlaying(episode)}
					>
						{playerProps.currentlyPlaying?.guid === episode?.guid ? (
							<>מנגן כרגע</>
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
