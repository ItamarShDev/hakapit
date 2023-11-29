import { fetch_rss } from "~/api/fetch-rss";
import { EpisodeData, Feed } from "~/api/types";

function _fetch() {
  const url = process?.env?.NITK_RSS || process?.env?.NEXT_PUBLIC_NITK_RSS;
  return fetch_rss(url);
}

export async function fetchEpisode(episodeGUID: string): Promise<EpisodeData> {
  const { items, ...rss } = await _fetch();
  const episode = items.find(
    (episode) => episode?.guid?.split("/").pop() === episodeGUID,
  );
  return episode as EpisodeData;
}

export async function fetchFeed(number: number = 5): Promise<Feed> {
  const rss = await _fetch();
  const episodes = rss.items.slice(0, number);
  rss.items = episodes;
  return rss as Feed;
}
