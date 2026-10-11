export function unwrapCdata(content: string) {
  return content.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}
