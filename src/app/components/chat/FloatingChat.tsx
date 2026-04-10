import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import { Image } from "@unpic/react";
import { CornerDownLeft, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "~/@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/@/components/ui/drawer";
import { Textarea } from "~/@/components/ui/textarea";
import { useIsDesktop } from "~/@/lib/use-is-desktop";
import { getDirectionFromText } from "~/app/utils/text-direction";

export function FloatingChat() {
  const { messages, sendMessage, isLoading, error } = useChat({
    connection: fetchServerSentEvents("/api/chat"),
  });
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const inputDir = getDirectionFromText(input);
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop("(min-width: 768px)");
  const drawerDirection = isDesktop ? "right" : "bottom";

  // Check if any tool is currently being called
  const activeTool = messages
    .flatMap((m) => m.parts || [])
    .find((p) => p.type === "tool-call" && (p as { state?: string }).state !== "complete");

  // Get tool name for display
  const activeToolName = activeTool ? (activeTool as { name?: string }).name : null;

  // Get combined content from message parts
  const getMessageContent = useCallback((message: (typeof messages)[0]) => {
    const parts = message.parts || [];
    return parts
      .filter((part) => part.type === "text")
      .map((part) => (part as { content: string }).content)
      .join("");
  }, []);

  // The most recent user message
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (isLoading) return;

    // Store the current input and clear it immediately
    const currentInput = input;
    setInput("");

    try {
      sendMessage(currentInput);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore input if sending fails, allowing user to retry
      setInput(currentInput);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to scroll to the bottom every time the answer or loading state changes.
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [messages]);

  // Move focus into the drawer as soon as it opens to avoid aria-hidden warnings
  useEffect(() => {
    if (!open) {
      return;
    }
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);

  // Refocus input after chat finishes loading
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const id = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => window.clearTimeout(id);
    }
  }, [isLoading, messages.length]);

  return (
    <div
      data-testid="floating-chat"
      className={"fixed bottom-4 left-4 xs:bottom-0 xs:left-0 xs:right-0 xs:px-4 xs:pb-4 z-50"}
    >
      <Drawer
        direction={drawerDirection as "right" | "bottom"}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            queueMicrotask(() => {
              triggerRef.current?.focus();
            });
          }
        }}
      >
        <DrawerTrigger asChild>
          <Button
            ref={triggerRef}
            data-testid="chat-trigger-button"
            size="lg"
            className={`text-accent hover:bg-accent hover:text-primary ${isDesktop ? "rounded-full" : "w-full rounded-lg"}`}
          >
            שאל אותי על ליברפול
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader dir="rtl" className="flex flex-col border-b border-slate-600">
            <DrawerTitle className="relative flex items-center justify-center sm:justify-between text-accent">
              <span data-testid="chat-title" className="mx-auto">
                Liver-Chat
              </span>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="סגור"
                  className="text-accent hover:bg-accent/10 absolute right-0 sm:static"
                >
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </DrawerTitle>

            <DrawerDescription data-testid="chat-description" dir="rtl" className="self-start">
              ניתן לשאול כל שאלה לגבי הקבוצה, בכל שפה
            </DrawerDescription>
          </DrawerHeader>
          <div ref={contentRef} data-testid="chat-messages" className="grow px-4 overflow-y-auto text-paragraph">
            {/* Tool indicator */}
            {activeToolName && (
              <div className="flex items-center gap-2 text-accent/70 py-2 text-sm" dir="rtl">
                <Search className="h-4 w-4 animate-pulse" />
                <span>מחפש באינטרנט...</span>
              </div>
            )}

            {messages.map((message) => {
              const content = getMessageContent(message);
              if (message.role === "assistant" && content) {
                const dir = getDirectionFromText(content);
                return (
                  <div key={message.id} dir={dir} className="py-2 text-sm whitespace-pre-wrap">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: (props) => (
                          <a {...props} className="underline text-accent" target="_blank" rel="noreferrer" />
                        ),
                        code: (props) => <code {...props} className="bg-black/30 rounded px-1" />,
                        pre: (props) => <pre {...props} className="bg-black/30 rounded p-2 overflow-x-auto" />,
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                );
              }
              if (message.role === "user") {
                const content = getMessageContent(message);
                const dir = getDirectionFromText(content);
                return (
                  <div
                    className="flex items-center gap-2 text-accent py-4 sticky top-0 bg-popover"
                    key={message.id}
                    dir={dir}
                  >
                    {content}
                    {message.id === lastUserMessage?.id && isLoading && (
                      <div className="h-8 w-8">
                        <Image
                          className="grayscale"
                          src="/liverpool-animation.gif"
                          alt="liverbird"
                          width={30}
                          height={30}
                          priority
                        />
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Error message with retry button */}
          {error && (
            <div className="flex flex-col items-center gap-2 px-4 py-2 text-red-500 text-sm text-center" dir="rtl">
              <div className="flex items-center gap-2">
                <span>שגיאה: {error?.message || "אירעה שגיאה לא ידועה"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
                  if (lastUserMsg) {
                    const content = lastUserMsg.parts
                      .filter((p) => p.type === "text")
                      .map((p) => (p as { content: string }).content)
                      .join("");
                    if (content) sendMessage(content);
                  }
                }}
                className="text-accent hover:text-accent/80"
              >
                נסה שוב
              </Button>
            </div>
          )}
          <div className="p-2 flex flex-row border-t items-center">
            <Button
              data-testid="chat-send-button"
              size="icon"
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-transparent"
            >
              <CornerDownLeft className="h-4 w-4" color="yellow" />
            </Button>
            <Textarea
              data-testid="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="הקלד שאלה..."
              dir={inputDir}
              className={`pr-10 border-0 text-accent bg-transparent ${inputDir === "ltr" ? "text-left" : "text-right"}`}
              disabled={isLoading}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
