import { Button } from "@/components/ui/button";
import { Cross1Icon } from "@radix-ui/react-icons";
import { createContext, forwardRef, useCallback, useContext, useRef, useState } from "react";
import { Episode } from "~/db/types";
type PlayerContextType = {
	currentlyPlaying: Episode | undefined;
	setCurrentlyPlaying: (episode?: Episode) => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);
const Player = forwardRef(function Player(
	{
		episode,
		closePlayer,
	}: {
		episode: Episode | undefined;
		closePlayer: () => void;
	},
	ref: React.ForwardedRef<HTMLAudioElement>,
) {
	return (
		<div className={`bottom-0 left-0 flex flex-col w-full p-2 bg-primary ${episode ? "fixed" : "hidden"}`}>
			<div className="flex flex-row items-start py-2">
				{episode?.imageUrl && (
					<img src={episode?.imageUrl} alt="episode" placeholder="blur" className="object-cover object-top w-16" />
				)}
				<div className="flex flex-col flex-1 px-2">
					<p className="text-white">{episode?.title}</p>
					<p className="text-slate-300">{episode?.podcast?.title}</p>
				</div>
				<Button variant="link" className="text-white" onClick={() => closePlayer()}>
					<Cross1Icon />
				</Button>
			</div>
			<audio ref={ref} className="audio" controls src={episode?.audioUrl}>
				<track kind="captions" />
			</audio>
		</div>
	);
});

export function PlayerProvider({ children }: { children: React.ReactNode }) {
	const [currentlyPlaying, setCurrentlyPlaying] = useState<Episode | undefined>(undefined);
	const ref = useRef<HTMLAudioElement | null>(null);
	const setCurrentEpisode = useCallback((episode?: Episode) => {
		ref.current?.pause();
		setCurrentlyPlaying(episode);
		if (!ref.current) return;
		ref.current?.load();
		ref.current.onloadeddata = () => {
			ref.current?.play();
		};
	}, []);
	const closePlayer = useCallback(() => {
		ref.current?.pause();
		setCurrentlyPlaying(undefined);
	}, []);
	return (
		<PlayerContext.Provider value={{ currentlyPlaying, setCurrentlyPlaying: setCurrentEpisode }}>
			<div className={`${currentlyPlaying ? "mb-36" : ""}`}>{children}</div>
			<Player episode={currentlyPlaying} ref={ref} closePlayer={closePlayer} />
		</PlayerContext.Provider>
	);
}

export function usePlayer() {
	return useContext(PlayerContext);
}
