import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { FloatingChat } from "./floating-chat";

test("renders the chat launcher without the heavy chat UI on the server", () => {
  const html = renderToStaticMarkup(createElement(FloatingChat));

  expect(html).toContain('data-testid="chat-trigger-button"');
  expect(html).toContain('aria-expanded="false"');
  expect(html).not.toContain("Chat could not be loaded");
  expect(html).not.toContain('data-testid="chat-input"');
  expect(html).not.toContain('data-testid="chat-send-button"');
});
