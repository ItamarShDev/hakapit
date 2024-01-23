import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@remix-run/react";
import { Episode } from "~/db/types";
import { toDateString } from "~/hooks";
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
	podcastName,
	className,
	contentClassName,
}: {
	episode?: Episode;
	podcastName: "hakapit" | "nitk" | "balcony-albums" | string;
	contentClassName?: React.HTMLAttributes<HTMLDivElement>["className"];
} & React.HTMLAttributes<HTMLDivElement>) {
	const isoDate = toDateString(episode?.publishedAt);
	return (
		<Card className={cn("episode-card relative max-w-xl rounded-3xl overflow-hidden", className)}>
			{episode?.imageUrl && (
				<img
					src={episode?.imageUrl}
					alt="episode"
					placeholder="blur"
					className="absolute object-cover object-top -z-10 rounded-3xl brightness-40 filter"
				/>
			)}
			<CardHeader>
				<CardTitle className="text-accent">
					<Link to={`/${podcastName}/episodes/${episode?.episodeNumber}`}>{episode?.title}</Link>
				</CardTitle>
				<CardDescription className="text-muted">{isoDate}</CardDescription>
			</CardHeader>
			<CardContent className={cn("flex-1 text-paragraph", contentClassName)}>
				{episode?.htmlDescription && (
					<div
						// biome-ignore lint: noDangerouslySetInnerHtml
						dangerouslySetInnerHTML={{
							__html: episode?.htmlDescription,
						}}
					/>
				)}
			</CardContent>
			<CardFooter>
				<audio className="audio" controls src={episode?.audioUrl}>
					<track kind="captions" />
				</audio>
			</CardFooter>
		</Card>
	);
}
