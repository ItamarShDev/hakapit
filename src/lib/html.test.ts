import { expect, it } from "bun:test";

import { sanitizeContent } from "./html";
it("preserves podcast and markdown formatting without active HTML", () => {
  const clean = sanitizeContent(
    '<h2>Title</h2><p><strong>Text</strong><a href="https://example.com">link</a><img src="https://example.com/a.png" onerror="alert(1)"/></p><script>alert(1)</script><iframe src="https://example.com"></iframe><a href="javascript:alert(1)">bad</a>',
  );
  expect(clean).toContain("<strong>Text</strong>");
  expect(clean).toContain('href="https://example.com"');
  expect(clean).not.toContain("<script");
  expect(clean).not.toContain("<iframe");
  expect(clean).not.toContain("onerror");
  expect(clean).not.toContain("javascript:");
});
