import { on, ref, type Handle, type RemixNode } from "remix/component";

import { Button } from "~/lib/ui/button";
import { CloseIcon } from "~/lib/ui/icons";

import type { Episode } from "~/features/podcast/types";
type PlayerState = {
  currentlyPlaying: Episode | undefined;
  isPlaying: boolean;
  setCurrentlyPlaying: (episode?: Episode) => void;
};
export function PlayerProvider(handle: Handle<{ children?: RemixNode }, PlayerState>) {
  let audio: HTMLAudioElement | undefined;
  let error: string | undefined;
  const state: PlayerState = {
    currentlyPlaying: undefined,
    isPlaying: false,
    setCurrentlyPlaying: async (episode) => {
      if (episode?.audioUrl === state.currentlyPlaying?.audioUrl && episode) {
        if (state.isPlaying) audio?.pause();
        else await audio?.play().catch(showError);
        return;
      }
      audio?.pause();
      state.currentlyPlaying = episode;
      state.isPlaying = false;
      error = undefined;
      await handle.update();
      if (!audio || !episode) return;
      audio.load();
      await audio.play().catch(showError);
    },
  };
  function showError() {
    state.currentlyPlaying = undefined;
    state.isPlaying = false;
    error = "הניגון נכשל — סביר להניח שנחסמת על ידי השירות";
    handle.update();
  }
  handle.context.set(state);
  handle.signal.addEventListener("abort", () => audio?.pause(), { once: true });
  return () => (
    <>
      {handle.props.children}
      <div
        className={`bottom-0 left-0 flex flex-col w-full p-2 bg-primary ${state.currentlyPlaying ? "fixed z-50" : "hidden"}`}
      >
        <div className="flex flex-row items-start py-2">
          {state.currentlyPlaying?.imageUrl && (
            <img
              src={state.currentlyPlaying.imageUrl}
              alt="episode"
              className="object-cover object-top w-16 h-16"
              width={64}
              height={64}
            />
          )}
          <div className="flex flex-col flex-1 px-4 leading-7">
            <p className="text-lg text-white">{state.currentlyPlaying?.title}</p>
          </div>
          <Button
            variant="link"
            className="text-white"
            aria-label="סגור נגן"
            mix={on("click", () => state.setCurrentlyPlaying())}
          >
            <CloseIcon />
          </Button>
        </div>
        <audio
          className="audio"
          controls
          src={state.currentlyPlaying?.audioUrl}
          mix={[
            ref((node) => {
              audio = node as HTMLAudioElement;
            }),
            on("playing", () => {
              state.isPlaying = true;
              handle.update();
            }),
            on("pause", () => {
              state.isPlaying = false;
              handle.update();
            }),
            on("ended", () => {
              state.isPlaying = false;
              handle.update();
            }),
            on("error", () => {
              if (state.currentlyPlaying) showError();
            }),
          ]}
        >
          <track kind="captions" />
        </audio>
      </div>
      {error && (
        <div role="alert" className="fixed bottom-4 right-4 z-50 rounded-lg bg-popover p-4 text-paragraph">
          {error}
          <button
            type="button"
            aria-label="סגור"
            className="px-2"
            mix={on("click", () => {
              error = undefined;
              handle.update();
            })}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
