import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { act } from "react";
import { createRoot } from "react-dom/client";

import { ChatErrorNotice } from "./chat-error-notice";

test("the chat alert Retry button invokes the supplied reload action", async () => {
  const happyWindow = new Window();
  const keys = ["window", "document", "navigator", "HTMLElement", "Node", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = new Map<string, unknown>();
  for (const key of keys) {
    previous.set(key, (globalThis as Record<string, unknown>)[key]);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value: key === "IS_REACT_ACT_ENVIRONMENT" ? true : (happyWindow as unknown as Record<string, unknown>)[key],
    });
  }

  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  let attempts = 0;
  try {
    await act(async () => {
      root.render(
        <ChatErrorNotice
          message="Chat unavailable"
          onRetry={async () => {
            attempts += 1;
          }}
        />,
      );
    });

    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Chat unavailable");
    await act(async () => {
      (container.querySelector("button") as HTMLButtonElement).click();
    });
    expect(attempts).toBe(1);
  } finally {
    await act(async () => root.unmount());
    happyWindow.close();
    for (const [key, value] of previous) {
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
  }
});
