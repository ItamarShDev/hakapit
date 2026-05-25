import { env } from '$env/dynamic/private';
import { LiverpoolId } from '$lib/types/soccer';
import type {
	League,
	TeamData,
	TeamMatches,
	Match,
	NextMatchData,
	SoccerSnapshot
} from '$lib/types/soccer';

const cache = new Map<string, { value: unknown; expiresAt: number }>();

function getCached<T>(key: string): T | null {
	const entry = cache.get(key);
	if (!entry) return null;
	if (entry.expiresAt <= Date.now()) {
		cache.delete(key);
		return null;
	}
	return entry.value as T;
}

function setCached<T>(key: string, value: T, ttlMs: number) {
	cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

async function getData<T>(path: string): Promise<T | null> {
	const key = env.FOOTBALL_DATA_API_KEY;
	if (!key) {
		console.warn('FOOTBALL_DATA_API_KEY not found');
		return null;
	}
	try {
		const url = `https://api.football-data.org/v4/${path}`;
		const response = await fetch(url, {
			headers: { 'X-Auth-Token': key }
		});
		if (!response.ok) return null;
		return (await response.json()) as T;
	} catch (error) {
		console.error(`Error fetching ${path}:`, error);
		return null;
	}
}

async function getDataCached<T>(key: string, ttlMs: number, fetcher: () => Promise<T | null>) {
	const cached = getCached<T>(key);
	if (cached != null) return cached;
	const value = await fetcher();
	if (value != null) setCached(key, value, ttlMs);
	return value;
}

async function getNextGames() {
	return getDataCached<TeamMatches>('games-liverpool-next', 20 * 60 * 1000, () =>
		getData<TeamMatches>(`teams/${LiverpoolId}/matches?status=SCHEDULED`)
	);
}

function getFirstMatch(teamMatches: TeamMatches | null): Match | undefined {
	return teamMatches?.matches[0];
}

async function getTeamPastMatches(id?: number) {
	return getDataCached<TeamMatches>(`games-${id}-past-5`, 3 * 60 * 60 * 1000, () =>
		getData<TeamMatches>(`teams/${id}/matches?status=FINISHED&limit=5`)
	);
}

async function getTeam(): Promise<TeamData | null> {
	return getDataCached<TeamData>(`team-${LiverpoolId}`, 6 * 60 * 60 * 1000, () =>
		getData<TeamData>(`teams/${LiverpoolId}`)
	);
}

async function getLeague(leagueCode: string): Promise<League | null> {
	return getDataCached<League>(`league-${leagueCode}`, 2 * 60 * 60 * 1000, () =>
		getData<League>(`competitions/${leagueCode}/standings`)
	);
}

async function getNextMatchData(): Promise<NextMatchData | null> {
	const nextGames = await getNextGames();
	const matchDetails = getFirstMatch(nextGames);
	if (!matchDetails) return null;

	const awayForm = await getTeamPastMatches(matchDetails.awayTeam?.id);
	const homeForm = await getTeamPastMatches(matchDetails.homeTeam?.id);

	return {
		matchDetails,
		awayForm: awayForm?.matches,
		homeForm: homeForm?.matches
	};
}

export async function getSoccerSnapshot(): Promise<SoccerSnapshot> {
	const cacheKey = 'soccer-snapshot';
	const cached = getCached<SoccerSnapshot>(cacheKey);
	if (cached) return cached;

	const team = await getTeam();

	const leagueIds =
		team?.runningCompetitions
			?.map((c) => c.code)
			.filter(Boolean)
			.filter((value, index, self) => self.indexOf(value) === index) ?? [];

	const leagues = await Promise.all(leagueIds.map((id) => getLeague(id)));
	const leaguesData = leagues
		.map((league, index) => {
			const leagueId = leagueIds[index];
			if (!league || !leagueId) return null;
			return { leagueId, league };
		})
		.filter(Boolean) as Array<{ leagueId: string; league: League }>;

	const nextMatchData = await getNextMatchData();

	const snapshot: SoccerSnapshot = { team, leaguesData, nextMatchData };
	setCached(cacheKey, snapshot, 10 * 60 * 1000);
	return snapshot;
}
