import { Cross1Icon } from "@radix-ui/react-icons";
import type { Doc } from "convex/_generated/dataModel";
import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/@/components/ui/button";
import { Toaster } from "~/@/components/ui/sonner";

type PlayerContextType = {
	currentlyPlaying: Doc<"episodes"> | undefined;
	setCurrentlyPlaying: (episode?: Doc<"episodes">) => void;
	isPlaying: boolean;
};

const PlayerContext = createContext<PlayerContextType | null>(null);
const Player = forwardRef(function Player(
	{
		episode,
		closePlayer,
	}: {
		episode: Doc<"episodes"> | undefined;
		closePlayer: () => void;
	},
	ref: React.ForwardedRef<HTMLAudioElement>,
) {
	const showError = useCallback(() => {
		closePlayer();
		toast.error("הניגון נכשל", { description: "סביר להניח שנחסמת על ידי השירות" });
	}, [closePlayer]);
	return (
		<div className={`bottom-0 left-0 flex flex-col w-full p-2 bg-primary ${episode ? "fixed z-50" : "hidden"}`}>
			<div className="flex flex-row items-start py-2">
				{episode?.imageUrl && (
					<img
						src={episode?.imageUrl}
						alt="episode"
						className="object-cover object-top w-16 h-16"
						width={64}
						height={64}
					/>
				)}
				<div className="flex flex-col flex-1 px-4 leading-7">
					<p className="text-lg text-white">{episode?.title}</p>
				</div>
				<Button variant="link" className="text-white" onClick={() => closePlayer()}>
					<Cross1Icon />
				</Button>
			</div>
			<audio ref={ref} className="audio" controls src={episode?.audioUrl} onError={() => showError()}>
				<track kind="captions" />
			</audio>
		</div>
	);
});

export function PlayerProvider({ children }: { children: React.ReactNode }) {
	const [currentlyPlaying, setCurrentlyPlaying] = useState<Doc<"episodes"> | undefined>(undefined);
	const [isPlaying, setIsPlaying] = useState(false);
	const ref = useRef<HTMLAudioElement | null>(null);
	const setCurrentEpisode = useCallback(
		(episode?: Doc<"episodes">) => {
			if (episode?.audioUrl === currentlyPlaying?.audioUrl) {
				if (isPlaying) {
					ref.current?.pause();
				} else {
					ref.current?.play();
				}
				return;
			}

			ref.current?.pause();

			setCurrentlyPlaying(episode);
			if (!ref.current) return;
			ref.current?.load();
			ref.current.onloadeddata = () => {
				ref.current?.play();
			};
		},
		[currentlyPlaying, isPlaying],
	);
	useEffect(() => {
		if (!ref.current) return;
		ref.current.onplaying = () => {
			setIsPlaying(true);
		};
		ref.current.onpause = () => {
			setIsPlaying(false);
		};
	}, []);
	const closePlayer = useCallback(() => {
		ref.current?.pause();
		setCurrentlyPlaying(undefined);
	}, []);
	return (
		<PlayerContext.Provider value={{ currentlyPlaying, setCurrentlyPlaying: setCurrentEpisode, isPlaying }}>
			<div className={`${currentlyPlaying ? "mb-36" : ""}`}>{children}</div>
			<Player episode={currentlyPlaying} ref={ref} closePlayer={closePlayer} />
			<Toaster richColors closeButton dir="rtl" />
		</PlayerContext.Provider>
	);
}

export function usePlayer() {
	return useContext(PlayerContext);
}
