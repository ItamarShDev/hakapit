import type { PageServerLoad } from './$types';
import { getSoccerSnapshot } from '$lib/providers/soccer';

export const load: PageServerLoad = async () => {
	try {
		const snapshot = await getSoccerSnapshot();
		return {
			snapshot
		};
	} catch (err) {
		console.warn('Failed to fetch soccer snapshot', err);
		return {
			snapshot: { team: null, leaguesData: [], nextMatchData: null }
		};
	}
};
