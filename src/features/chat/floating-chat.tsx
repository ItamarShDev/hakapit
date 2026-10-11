import { useCallback, useRef, useState } from "react";

import { usePlayer } from "~/layouts/player/provider";
import { Button } from "~/lib/ui/button";
import { useIsDesktop } from "~/lib/use-is-desktop";

type ChatProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ChatComponent = React.ComponentType<ChatProps>;

export function FloatingChat() {
  const [Chat, setChat] = useState<ChatComponent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const loadPromiseRef = useRef<Promise<ChatComponent> | null>(null);
  const isDesktop = useIsDesktop("(min-width: 768px)");
  const player = usePlayer();

  const loadChat = useCallback(() => {
    if (Chat) return Promise.resolve(Chat);
    if (loadPromiseRef.current) return loadPromiseRef.current;

    setIsLoading(true);
    setLoadError(null);
    const promise = import("./floating-chat-content")
      .then(({ FloatingChatContent }) => FloatingChatContent)
      .then((component) => {
        setChat(() => component);
        return component;
      })
      .catch((error: unknown) => {
        const normalizedError = error instanceof Error ? error : new Error("Chat failed to load");
        setLoadError(normalizedError);
        throw normalizedError;
      })
      .finally(() => {
        setIsLoading(false);
        loadPromiseRef.current = null;
      });
    loadPromiseRef.current = promise;
    return promise;
  }, [Chat]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      queueMicrotask(() => {
        triggerRef.current?.focus();
      });
    }
  };

  const handleOpen = () => {
    if (open) {
      handleOpenChange(false);
      return;
    }

    setOpen(true);
    void loadChat().catch(() => undefined);
  };

  const handleRetry = () => {
    void loadChat()
      .then(() => setOpen(true))
      .catch(() => undefined);
  };

  return (
    <div
      data-testid="floating-chat"
      className={"fixed bottom-0 left-4 pb-4 xs:left-0 xs:right-0 xs:px-4 z-50"}
      style={player?.playerHeight ? { bottom: `${player.playerHeight}px` } : undefined}
    >
      <Button
        ref={triggerRef}
        data-testid="chat-trigger-button"
        size="lg"
        aria-expanded={open}
        aria-controls="floating-chat-panel"
        onPointerEnter={() => void loadChat().catch(() => undefined)}
        onFocus={() => void loadChat().catch(() => undefined)}
        onClick={handleOpen}
        className={`text-accent hover:bg-accent hover:text-primary ${isDesktop ? "rounded-full" : "w-full rounded-lg"}`}
      >
        שאל אותי על ליברפול
      </Button>

      {open && !Chat && isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="mt-2 rounded-lg bg-popover p-4 text-center text-accent shadow-lg"
        >
          טוען את הצ׳אט…
        </div>
      )}
      {open && !Chat && !isLoading && loadError && (
        <div
          role="alert"
          className="mt-2 flex flex-col items-center gap-2 rounded-lg bg-popover p-4 text-center text-accent shadow-lg"
        >
          <span>טעינת הצ׳אט נכשלה.</span>
          <Button type="button" size="sm" onClick={handleRetry}>
            נסה שוב
          </Button>
        </div>
      )}

      {Chat && <Chat open={open} onOpenChange={handleOpenChange} />}
    </div>
  );
}
