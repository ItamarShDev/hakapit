import { Cross1Icon } from "@radix-ui/react-icons";
import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "~/lib/ui/button";
import { Toaster } from "~/lib/ui/sonner";

import type { Episode } from "~/features/podcast/types";

type PlayerContextType = {
  currentlyPlaying: Episode | undefined;
  setCurrentlyPlaying: (episode?: Episode) => void;
  isPlaying: boolean;
  playerHeight: number;
};

const PlayerContext = createContext<PlayerContextType | null>(null);
const Player = forwardRef(function Player(
  {
    episode,
    closePlayer,
    containerRef,
  }: {
    episode: Episode | undefined;
    closePlayer: () => void;
    containerRef: React.Ref<HTMLDivElement>;
  },
  ref: React.ForwardedRef<HTMLAudioElement>,
) {
  const showError = useCallback(() => {
    closePlayer();
    toast.error("הניגון נכשל", { description: "סביר להניח שנחסמת על ידי השירות" });
  }, [closePlayer]);
  return (
    <div
      ref={containerRef}
      className={`bottom-0 left-0 flex flex-col w-full p-2 bg-primary ${episode ? "fixed z-50" : "hidden"}`}
    >
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
        <Button
          type="button"
          variant="link"
          className="text-white"
          aria-label="Close player"
          onClick={() => closePlayer()}
        >
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
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Episode | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerHeight, setPlayerHeight] = useState(0);
  const ref = useRef<HTMLAudioElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const setCurrentEpisode = useCallback(
    (episode?: Episode) => {
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
  useEffect(() => {
    const element = playerContainerRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const updateHeight = () => setPlayerHeight(element.getBoundingClientRect().height);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, [currentlyPlaying]);
  const closePlayer = useCallback(() => {
    ref.current?.pause();
    setCurrentlyPlaying(undefined);
  }, []);
  return (
    <PlayerContext.Provider
      value={{ currentlyPlaying, setCurrentlyPlaying: setCurrentEpisode, isPlaying, playerHeight }}
    >
      <div style={{ marginBottom: playerHeight > 0 ? `${playerHeight}px` : undefined }}>{children}</div>
      <Player episode={currentlyPlaying} ref={ref} closePlayer={closePlayer} containerRef={playerContainerRef} />
      <Toaster richColors closeButton dir="rtl" />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
