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
	const feed = await fetchPodcastRss(podcast, 10);

	return {
		podcast,
		feed: {
			name: podcast,
			title: feed.title || podcast,
			description: feed.description,
			imageUrl: feed.itunes?.image,
			authorName: feed.itunes?.owner?.name,
			totalEpisodes: feed.items.length,
			episodes: feed.items.map((item, index) => ({
				_id: item.episodeGUID || `ep-${index}`,
				episodeNumber: item.number,
				guid: item.episodeGUID,
				title: item.title,
				link: item.link,
				description: item.contentSnippet,
				htmlDescription: item.content,
				imageUrl: item.itunes?.image,
				audioUrl: item.enclosure?.url || '',
				publishedAt: item.isoDate ? new Date(item.isoDate).getTime() : undefined,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				duration: item.itunes?.duration,
				podcastId: podcast
			}))
		}
	};
};
