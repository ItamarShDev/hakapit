import { expect, test } from "bun:test";

import { sanitizeContent } from "./html";

test("preserves formatted podcast HTML and removes executable markup", () => {
  const content = sanitizeContent(
    '<h2>Title</h2><p><strong>Text</strong><a href="https://example.com">link</a><img src="https://example.com/a.png" onerror="alert(1)"></p><script>alert(1)</script><iframe src="https://example.com"></iframe><a href="javascript:alert(1)">unsafe</a>',
  );

  expect(content).toContain("<strong>Text</strong>");
  expect(content).toContain('href="https://example.com"');
  expect(content).not.toContain("<script");
  expect(content).not.toContain("<iframe");
  expect(content).not.toContain("onerror");
  expect(content).not.toContain("javascript:");
});

test("unwraps RSS CDATA before sanitizing its contents", () => {
  const content = sanitizeContent(
    '<![CDATA[<p>Podcast description</p><strong>YNWA</strong><script>alert(1)</script><img src="https://example.com/a.png" onerror="alert(1)"><iframe src="https://example.com"></iframe><a href="javascript:alert(1)">unsafe</a>]]>',
  );

  expect(content).toContain("<p>Podcast description</p>");
  expect(content).toContain("<strong>YNWA</strong>");
  expect(content).not.toContain("CDATA");
  expect(content).not.toContain("<script");
  expect(content).not.toContain("<iframe");
  expect(content).not.toContain("onerror");
  expect(content).not.toContain("javascript:");
});
