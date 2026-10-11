import sanitizeHtml from "sanitize-html";

import { unwrapCdata } from "./rss-content";

export function sanitizeContent(html: string) {
  const content = unwrapCdata(html);
  return sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "loading"],
      a: ["href", "name", "target", "rel"],
    },
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
  });
}
