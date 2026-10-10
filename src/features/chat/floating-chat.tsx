import { marked } from "marked";
import { on, ref, unsafeHTML, type Handle } from "remix/component";

import { readChatStream } from "~/features/chat/chat-stream";
import { sanitizeContent } from "~/lib/html";
import { getDirectionFromText } from "~/lib/text-direction";
import { Button } from "~/lib/ui/button";
import { CloseIcon, SendIcon } from "~/lib/ui/icons";
import { Textarea } from "~/lib/ui/textarea";
type Message = { id: string; role: "user" | "assistant"; content: string };
export function FloatingChat(handle: Handle) {
  let input = "";
  let messages: Message[] = [];
  let loading = false;
  let searching = false;
  let error: string | undefined;
  let swipe: { x: number; y: number } | undefined;
  let dialog: HTMLDialogElement | undefined;
  let trigger: HTMLButtonElement | undefined;
  let textarea: HTMLTextAreaElement | undefined;
  let content: HTMLDivElement | undefined;
  function focusInput() {
    textarea?.focus();
  }
  function close() {
    dialog?.close();
    trigger?.focus();
  }
  async function update() {
    await handle.update();
    if (content) content.scrollTop = content.scrollHeight;
  }
  async function send(text = input, retry = false) {
    if (!text.trim() || loading) return;
    if (!retry) messages.push({ id: crypto.randomUUID(), role: "user", content: text });
    input = "";
    loading = true;
    searching = false;
    error = undefined;
    const history = messages.map(({ role, content }) => ({ role, content }));
    const assistant: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };
    messages.push(assistant);
    await update();
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: handle.signal,
      });
      await readChatStream(
        response,
        (chunk) => {
          if (chunk.type === "TEXT_MESSAGE_CONTENT") assistant.content += String(chunk.delta ?? "");
          if (chunk.type === "TOOL_CALL_START") searching = true;
          if (chunk.type === "TOOL_CALL_END" || chunk.type === "TOOL_CALL_RESULT") searching = false;
          if (chunk.type === "RUN_ERROR")
            throw new Error(String((chunk.error as { message?: string })?.message ?? "אירעה שגיאה"));
          update();
        },
        handle.signal,
      );
    } catch (cause) {
      if (!handle.signal.aborted) error = cause instanceof Error ? cause.message : "אירעה שגיאה לא ידועה";
    } finally {
      if (!handle.signal.aborted) {
        loading = false;
        searching = false;
        await update();
        focusInput();
      }
    }
  }
  return () => {
    const inputDir = getDirectionFromText(input);
    const lastUser = messages.filter((message) => message.role === "user").at(-1);
    return (
      <div
        data-testid="floating-chat"
        className="fixed bottom-4 left-4 xs:bottom-0 xs:left-0 xs:right-0 xs:px-4 xs:pb-4 z-50"
      >
        <Button
          data-testid="chat-trigger-button"
          size="lg"
          className="text-accent hover:bg-accent hover:text-primary rounded-lg w-full md:rounded-full md:w-auto"
          mix={[
            ref((node) => {
              trigger = node as HTMLButtonElement;
            }),
            on("click", () => {
              dialog?.showModal();
              focusInput();
            }),
          ]}
        >
          שאל אותי על ליברפול
        </Button>
        <dialog
          aria-labelledby="chat-title"
          aria-describedby="chat-description"
          className="chat-dialog fixed inset-x-0 top-auto bottom-0 m-0 max-h-none max-w-none h-5/6 w-full border-t border-slate-600 bg-popover text-paragraph p-0 md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-96 md:border-t-0 md:border-l"
          mix={[
            ref((node) => {
              dialog = node as HTMLDialogElement;
            }),
            on("pointerdown", (event) => {
              if ((event.target as Element).closest("h2")) swipe = { x: event.clientX, y: event.clientY };
            }),
            on("pointerup", (event) => {
              if (!swipe) return;
              const desktop = window.matchMedia("(min-width:768px)").matches;
              if ((desktop ? event.clientX - swipe.x : event.clientY - swipe.y) > 80) close();
              swipe = undefined;
            }),
            on("click", (event) => {
              if (event.target === dialog) {
                const rect = dialog!.getBoundingClientRect();
                if (
                  event.clientX < rect.left ||
                  event.clientX > rect.right ||
                  event.clientY < rect.top ||
                  event.clientY > rect.bottom
                )
                  close();
              }
            }),
            on("close", () => trigger?.focus()),
          ]}
        >
          <div className="flex h-full min-h-0 flex-col">
            <div dir="rtl" className="flex flex-col border-b border-slate-600 gap-1.5 p-4 text-center sm:text-left">
              <h2 className="relative flex items-center justify-center sm:justify-between text-accent text-lg font-semibold leading-none tracking-tight">
                <span id="chat-title" data-testid="chat-title" className="mx-auto">
                  Liver-Chat
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="סגור"
                  className="text-accent hover:bg-accent/10 absolute right-0 sm:static"
                  mix={on("click", close)}
                >
                  <CloseIcon className="h-5 w-5" />
                </Button>
              </h2>
              <p
                id="chat-description"
                data-testid="chat-description"
                dir="rtl"
                className="self-start text-sm text-muted-foreground"
              >
                ניתן לשאול כל שאלה לגבי הקבוצה, בכל שפה
              </p>
            </div>
            <div
              data-testid="chat-messages"
              aria-live="polite"
              className="grow px-4 overflow-y-auto text-paragraph"
              mix={ref((node) => {
                content = node as HTMLDivElement;
              })}
            >
              {searching && (
                <div className="flex items-center gap-2 text-accent/70 py-2 text-sm animate-pulse" dir="rtl">
                  מחפש באינטרנט...
                </div>
              )}
              {messages.map((message) =>
                message.role === "assistant" ? (
                  message.content && (
                    <div
                      key={message.id}
                      dir={getDirectionFromText(message.content)}
                      className="chat-markdown py-2 text-sm whitespace-pre-wrap"
                      innerHTML={unsafeHTML(sanitizeContent(marked.parse(message.content, { async: false })))}
                    />
                  )
                ) : (
                  <div
                    key={message.id}
                    className="flex items-center gap-2 text-accent py-4 sticky top-0 bg-popover"
                    dir={getDirectionFromText(message.content)}
                  >
                    {message.content}
                    {message.id === lastUser?.id && loading && (
                      <div className="h-8 w-8">
                        <img
                          className="grayscale"
                          src="/liverpool-animation.gif"
                          alt="liverbird"
                          width={30}
                          height={30}
                        />
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
            {error && (
              <div
                role="alert"
                className="flex flex-col items-center gap-2 px-4 py-2 text-red-500 text-sm text-center"
                dir="rtl"
              >
                <span>שגיאה: {error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  mix={on("click", () => {
                    if (lastUser) send(lastUser.content, true);
                  })}
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
                aria-label="שלח"
                disabled={loading}
                className="bg-transparent text-yellow-300"
                mix={on("click", () => send())}
              >
                <SendIcon className="h-4 w-4" />
              </Button>
              <Textarea
                data-testid="chat-input"
                value={input}
                placeholder="הקלד שאלה..."
                dir={inputDir}
                className={`pr-10 border-0 text-accent bg-transparent ${inputDir === "ltr" ? "text-left" : "text-right"}`}
                disabled={loading}
                mix={[
                  ref((node) => {
                    textarea = node as HTMLTextAreaElement;
                  }),
                  on("input", (event) => {
                    input = (event.currentTarget as HTMLTextAreaElement).value;
                    handle.update();
                  }),
                  on("keydown", (event) => {
                    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
                      event.preventDefault();
                      send();
                    }
                  }),
                ]}
              />
            </div>
          </div>
        </dialog>
      </div>
    );
  };
}
