import Parser from "rss-parser";

export async function fetch_rss(url: string | undefined) {
  if (!url) {
    throw new Error("No RSS URL provided");
  }
  const parser: Parser = new Parser();
  const rss = await parser.parseURL(url as string);
  const { items } = rss;
  const episodes = items.map((item) => {
    const episodeNumber = item.link?.split("/").pop()?.split("-")[0];
    return {
      ...item,
      episodeNumber: episodeNumber && parseInt(episodeNumber),
    };
  });
  rss.items = episodes;
  return { ...rss };
}
