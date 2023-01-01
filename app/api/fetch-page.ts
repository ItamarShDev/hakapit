import {
  fetchFeed as fetchBalcony,
  fetchEpisode as fetchBalconyEpisode,
} from "./balcony-albums/feed";
import {
  fetchFeed as fetchKapit,
  fetchEpisode as fetchKapitEpisode,
} from "./hakapit/feed";
import {
  fetchFeed as fetchNitk,
  fetchEpisode as fetchNitkEpisode,
} from "./nitk/feed";
export function fetchPage(podcastName: string, page: number = 1) {
  switch (podcastName) {
    case "hakapit":
      return fetchKapit(page);
    case "nitk":
      return fetchNitk(page);
    case "balcony-albums":
      return fetchBalcony(page);
  }
}
export function fetchEpisode(podcastName: string, episodeNumber: number) {
  switch (podcastName) {
    case "hakapit":
      return fetchKapitEpisode(episodeNumber);
    case "nitk":
      return fetchNitkEpisode(episodeNumber);
    case "balcony-albums":
      return fetchBalconyEpisode(episodeNumber);
  }
}
