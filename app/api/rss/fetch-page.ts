import {
	fetchEpisode as fetchBalconyEpisode,
	fetchFeed as fetchBalcony,
} from "./balcony-albums/feed";
import {
	fetchEpisode as fetchKapitEpisode,
	fetchFeed as fetchKapit,
} from "./hakapit/feed";
import {
	fetchEpisode as fetchNitkEpisode,
	fetchFeed as fetchNitk,
} from "./nitk/feed";
export function fetchPage(
	podcastName: "hakapit" | "nitk" | "balcony-albums" | string,
	number = 5,
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
