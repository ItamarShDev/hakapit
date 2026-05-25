import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { validatePodcastParam } from '$lib/types/podcast';
import { fetchPodcastRss } from '$lib/providers/rss';
import type { PodcastName } from '$lib/types/podcast';

export const load: PageServerLoad = async ({ params }) => {
	if (!validatePodcastParam(params.podcast)) {
		redirect(302, '/');
	}

	const podcast = params.podcast as PodcastName;
	const feed = await fetchPodcastRss(podcast, 1);

	const item = feed.items[0];

	if (!item) {
		return {
			podcast,
			episode: null
		};
	}

	return {
		podcast,
		episode: {
			_id: item.episodeGUID || 'latest',
			episodeNumber: item.number,
			guid: item.episodeGUID,
			title: item.title,
			link: item.link,
			description: item.content || item.contentSnippet,
			htmlDescription: item.content,
			imageUrl: item.itunes?.image,
			audioUrl: item.enclosure?.url || '',
			publishedAt: item.isoDate ? new Date(item.isoDate).getTime() : undefined,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			duration: item.itunes?.duration,
			podcastId: podcast
		}
	};
};
