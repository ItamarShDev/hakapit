import { fetch_rss } from "../fetch-rss";
import type { EpisodeData, Feed } from "../types";

function _fetch() {
  const url = process?.env?.NITK_RSS;
  return fetch_rss(url);
}

export async function fetchEpisode(episodeGUID: string): Promise<Feed> {
  const { items, ...rss } = await _fetch();
  const episode = items.find((episode) => episode?.episodeGUID == episodeGUID);
  rss.items = [episode];
  return rss as Feed;
}

export async function fetchFeed(pageNumber: number = 1): Promise<Feed> {
  const rss = await _fetch();
  const start = (pageNumber - 1) * 10;
  const end = start + 10;
  const episodes = rss.items.slice(start, end);
  rss.items = episodes;
  return rss as Feed;
}
