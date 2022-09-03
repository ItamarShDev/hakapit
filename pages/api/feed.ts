import { NextApiRequest, NextApiResponse } from "next";
import Parser from "rss-parser";
async function _fetch(url: string) {
  const parser: Parser = new Parser();
  const rss = await parser.parseURL(url);
  const { items } = rss;
  const episodes = items.map((item, index) => ({
    ...item,
    episodeNumber: items.length - index,
  }));
  return { ...rss, episodes };
}
export async function fetchEpisode(url: string, episodeNumber: number = 1) {
  const { episodes, ...rss } = await _fetch(url);
  const episode = episodes[episodeNumber - 1];
  return { ...rss, title: episode?.title, episode };
}

export async function fetchFeed(url: string, pageNumber: number = 1) {
  const { episodes: items, ...rss } = await _fetch(url);
  const start = (pageNumber - 1) * 10;
  const end = start + 10;
  const episodes = items
    .map((item, index) => ({
      ...item,
      episodeNumber: items.length - index,
    }))
    .slice(start, end);

  return { ...rss, items: episodes };
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page } = req.query;

  if (!process.env.RSS) {
    res.status(500).json({ error: "Missing RSS URL" });
    return;
  }
  const pageNumber = page ? parseInt(page as string) : 1;
  const feed = await fetchFeed(process.env.RSS, pageNumber);

  res.status(200).json({ ...feed });
}
