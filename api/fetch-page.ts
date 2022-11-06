import { fetchFeed as fetchBalcony } from "api/balcony-albums/feed";
import { fetchFeed as fetchKapit } from "api/hakapit/feed";
import { fetchFeed as fetchNitk } from "api/nitk/feed";
export function fetchPage(
  podcastName: "hakapit" | "nitk" | "balcony-albums",
  page: number = 1
) {
  switch (podcastName) {
    case "hakapit":
      return fetchKapit(page);
    case "nitk":
      return fetchNitk(page);
    case "balcony-albums":
      return fetchBalcony(page);
  }
}
