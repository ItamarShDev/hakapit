import sanitizeHtml from "sanitize-html";
export function sanitizeContent(html: string) {
  const content = html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
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
