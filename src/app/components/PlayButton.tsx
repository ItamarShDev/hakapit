import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";
import { cn } from "~/@/lib/utils";
import { usePlayer } from "~/app/layouts/Player/provider";
import type { EpisodeWithPodcast } from "~/app/utils";

interface PlayButtonProps {
	episode: EpisodeWithPodcast;
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function PlayButton({ episode, size = "md", className }: PlayButtonProps) {
	const playerProps = usePlayer();
	if (!playerProps) return null;

	const isPlaying = playerProps.isPlaying && playerProps.currentlyPlaying?.guid === episode?.guid;

	const sizeClasses = {
		sm: "size-4",
		md: "size-7 md:size-4",
		lg: "size-8 md:size-6",
	};

	return (
		<div className={cn("relative z-10", sizeClasses[size], className)}>
			<PlayIcon
				className={cn(
					"absolute inset-0 transition-all duration-300 ease-in-out",
					isPlaying ? "scale-0 rotate-180 opacity-0" : "scale-100 rotate-0 opacity-100",
				)}
			/>
			<PauseIcon
				className={cn(
					"absolute inset-0 transition-all duration-300 ease-in-out",
					isPlaying ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-180 opacity-0",
				)}
			/>
		</div>
	);
}
