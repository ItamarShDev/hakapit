import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MenuToggle, MOBILE_NAVIGATION_ID } from "./menu";

test("renders a named SSR menu toggle connected to its navigation", () => {
  const html = renderToStaticMarkup(createElement(MenuToggle, { expanded: true, onClick: () => {} }));

  expect(html).toContain('aria-label="Toggle navigation menu"');
  expect(html).toContain('aria-expanded="true"');
  expect(html).toContain(`aria-controls="${MOBILE_NAVIGATION_ID}"`);
});
