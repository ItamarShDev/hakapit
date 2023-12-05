import { fetchFeed as fetchBalcony, fetchEpisode as fetchBalconyEpisode } from "./balcony-albums/feed";
import { fetchFeed as fetchKapit, fetchEpisode as fetchKapitEpisode } from "./hakapit/feed";
import { fetchFeed as fetchNitk, fetchEpisode as fetchNitkEpisode } from "./nitk/feed";
export function fetchPage(
  podcastName: "hakapit" | "nitk" | "balcony-albums" | string,
  number: number = 5,
) {
  switch (podcastName) {
    case "hakapit":
      return fetchKapit(number);
    case "nitk":
      return fetchNitk(number);
    case "balcony-albums":
      return fetchBalcony(number);
  }
}
export function fetchEpisode(
  podcastName: "hakapit" | "nitk" | "balcony-albums" | string,
  episodeGUID: string,
) {
  switch (podcastName) {
    case "hakapit":
      return fetchKapitEpisode(episodeGUID);
    case "nitk":
      return fetchNitkEpisode(episodeGUID);
    case "balcony-albums":
      return fetchBalconyEpisode(episodeGUID);
    default:
      return fetchKapitEpisode(episodeGUID);
  }
}
