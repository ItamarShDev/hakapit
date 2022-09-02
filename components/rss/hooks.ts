import { useEffect, useState } from "react";
import { EpisodeData } from "./types";

type RssFeed = {
  description?: string | null;
  episodes?: EpisodeData[];
  title?: string | null;
  author?: string | null;
  image?: string | null;
};
export function getEpisodeData(episode: Element): EpisodeData {
  const title = episode.querySelector("title")?.textContent;
  const link = episode.querySelector("link")?.textContent;
  const description = episode.querySelector("description")?.textContent;
  const pubDate = episode.querySelector("pubDate")?.textContent;
  const guid = episode.querySelector("guid")?.textContent;
  const duration = episode.getElementsByTagNameNS("*", "duration")[0]
    ?.textContent;
  const imageUrl = episode
    .getElementsByTagNameNS("*", "image")[0]
    ?.getAttribute("href");
  const audioUrl = episode.querySelector("enclosure")?.getAttribute("url");

  return {
    guid,
    title,
    link,
    description,
    pubDate,
    duration,
    imageUrl,
    audioUrl,
  };
}
export function useRssFeed(rss: string): RssFeed {
  const [data, setData] = useState<RssFeed>({});
  useEffect(() => {
    const res = new window.DOMParser().parseFromString(rss, "text/xml");
    const description = res?.querySelector(
      "channel > description"
    )?.textContent;
    const title = res?.querySelector("channel > title")?.textContent;
    const image = res?.querySelector("channel > image > url")?.textContent;
    const author = res?.querySelector("channel > author")?.textContent;

    const episodes = Array.from(res.querySelectorAll("item")).map((item) =>
      getEpisodeData(item)
    );
    setData({ description, episodes, title, image, author });
  }, [rss]);
  return data;
}
