import { NextApiRequest, NextApiResponse } from "next";
import { fetch_rss } from "queries/fetch-rss";
import Parser from "rss-parser";

function _fetch() {
  const url = process?.env?.NITK_RSS || process?.env?.NEXT_PUBLIC_NITK_RSS;
  return fetch_rss(url);
}

export async function fetchEpisode(episodeGUID: string): Promise<EpisodeData> {
  const { items, ...rss } = await _fetch();
  const episode = items.find(
    (episode) => episode?.guid?.split("/").pop() === episodeGUID
  );
  return episode as EpisodeData;
}
export type EpisodeData = {
  guid: string;
  title: string;
  link: string;
  content: string;
  pubDate: string;
  duration: string;
  imageUrl: string;
  audioUrl: string;
  isoDate: string;
  itunes: { image: string; duration: string };
  enclosure: { url: string };
  episodeNumber?: number;
};

export type Feed = {
  items: EpisodeData[];
  image?: { link?: string; url: string; title?: string };
  paginationLinks?: Parser.PaginationLinks;
  link?: string;
  title?: string;
  feedUrl?: string;
  description?: string;
  itunes: {
    image?: string;
    owner?: { name?: string; email?: string };
    author?: string;
    summary?: string;
    explicit?: string;
    categories?: string[];
    keywords?: string[];
  };
};
export async function fetchFeed(pageNumber: number = 1): Promise<Feed> {
  const rss = await _fetch();
  const start = (pageNumber - 1) * 10;
  const end = start + 10;
  const episodes = rss.items.slice(start, end);
  rss.items = episodes;
  return rss as Feed;
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page } = req.query;

  if (!process.env.NITK_RSS) {
    res.status(500).json({ error: "Missing RSS URL" });
    return;
  }
  const pageNumber = page ? parseInt(page as string) : 1;
  const feed = await fetchFeed(pageNumber);
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );

  res.status(200).json(feed);
}
