export type PodcastName = 'hakapit' | 'nitk' | 'balcony-albums';

export interface EpisodeData {
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
	episodeGUID?: string;
	contentSnippet?: string;
	number: number;
}

export interface Feed {
	items: EpisodeData[];
	image?: { link?: string; url: string; title?: string };
	link?: string;
	title: string;
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
}

export interface Episode {
	_id: string;
	episodeNumber: number;
	guid?: string;
	title: string;
	link?: string;
	description?: string;
	htmlDescription?: string;
	imageUrl?: string;
	audioUrl: string;
	publishedAt?: number;
	createdAt: number;
	updatedAt: number;
	duration?: string;
	podcastId: string;
}

export interface Podcast {
	_id: string;
	name: string;
	title: string;
	link?: string;
	description?: string;
	imageUrl?: string;
	feedUrl?: string;
	authorName?: string;
	authorEmail?: string;
	authorSummary?: string;
	authorImageUrl?: string;
	createdAt: number;
	updatedAt: number;
}

export interface PodcastWithEpisodes {
	name: string;
	title: string;
	description?: string;
	imageUrl?: string;
	authorName?: string;
	totalEpisodes?: number;
	episodes: Episode[];
}

export interface EpisodeWithPodcast extends Episode {
	podcast?: {
		name: string;
	};
}

export const PODCAST_META: Record<PodcastName, { title: string; imageUrl: string }> = {
	hakapit: {
		title: 'הכפית',
		imageUrl:
			'https://storage.pinecast.net/podcasts/covers/29ae23b9-9411-48e0-a947-efd71e9e82ea/Kapit_Logo_Red_Background.jpg'
	},
	'balcony-albums': {
		title: 'אלבומים במרפסת',
		imageUrl:
			'https://storage.pinecast.net/podcasts/covers/04d1b0d7-965e-4a89-a990-2e87f531bcce/_____________________________2.jpg'
	},
	nitk: {
		title: 'שכונה בממלכה',
		imageUrl:
			'https://storage.pinecast.net/podcasts/covers/a5676696-e6ab-460a-a5ec-47d5299eb547/IMG-20220206-WA0010.jpg'
	}
};

export function validatePodcastParam(podcast: string): podcast is PodcastName {
	const validPodcasts: string[] = ['hakapit', 'nitk', 'balcony-albums'];
	return validPodcasts.includes(podcast);
}
