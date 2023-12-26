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
import { Link, unstable_useViewTransitionState } from "@remix-run/react";
import type { EpisodeData } from "~/api/rss/types";
import { isDate } from "~/hooks";
export function SkeletonCard({
	className,
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<Card
			className={cn(
				"episode-card h-full w-full max-w-xl rounded-3xl",
				className,
			)}
		>
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
	podcastName,
	className,
	contentClassName,
}: {
	episode?: EpisodeData;
	podcastName: "hakapit" | "nitk" | "balcony-albums" | string;
	contentClassName?: React.HTMLAttributes<HTMLDivElement>["className"];
} & React.HTMLAttributes<HTMLDivElement>) {
	const isTransitioning = unstable_useViewTransitionState(
		`/${podcastName}/episodes/${episode?.episodeGUID}`,
	);
	const isoDate = isDate(episode?.isoDate);
	return (
		<Card
			className={cn(
				"episode-card relative max-w-xl rounded-3xl overflow-hidden",
				className,
			)}
			style={{
				viewTransitionName: isTransitioning ? "image-expand" : "",
			}}
		>
			{episode?.itunes?.image && (
				<img
					src={episode?.itunes?.image}
					alt="episode"
					placeholder="blur"
					className="absolute object-cover object-top -z-10 rounded-3xl brightness-40 filter"
				/>
			)}
			<CardHeader>
				<CardTitle className="text-accent">
					<Link
						to={`/${podcastName}/episodes/${episode?.episodeGUID}`}
					>
						{episode?.title}
					</Link>
				</CardTitle>
				<CardDescription className="text-muted">
					{isoDate}
				</CardDescription>
			</CardHeader>
			<CardContent
				className={cn("flex-1 text-paragraph", contentClassName)}
			>
				{episode?.content && (
					<div
						// biome-ignore lint: noDangerouslySetInnerHtml
						dangerouslySetInnerHTML={{
							__html: episode?.content,
						}}
					/>
				)}
			</CardContent>
			<CardFooter>
				<audio className="audio" controls src={episode?.enclosure?.url}>
					<track kind="captions" />
				</audio>
			</CardFooter>
		</Card>
	);
}
