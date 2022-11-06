import { fetch_rss } from "api/fetch-rss";
import { EpisodeData, Feed } from "api/types";

function _fetch() {
  const url = process.env.HAKAPIT_RSS || process.env.NEXT_PUBLIC_HAKAPIT_RSS;
  return fetch_rss(url);
}

export async function fetchEpisode(episodeGUID: string): Promise<EpisodeData> {
  const { items, ...rss } = await _fetch();
  const episode = items.find(
    (episode) => episode?.guid?.split("/").pop() === episodeGUID
  );
  return episode as EpisodeData;
}

export async function fetchFeed(pageNumber: number = 1): Promise<Feed> {
  const rss = await _fetch();
  const start = (pageNumber - 1) * 10;
  const end = start + 10;
  const episodes = rss.items.slice(start, end);
  rss.items = episodes;
  return rss as Feed;
}
