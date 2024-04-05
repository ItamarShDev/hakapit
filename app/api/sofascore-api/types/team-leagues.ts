export interface TeamLeagues {
	tournamentSeasons: TournamentSeason[];
}

export interface TournamentSeason {
	tournament: Tournament;
	seasons: Season[];
}

export interface Tournament {
	name: string;
	slug: string;
	category: Category;
	uniqueTournament: UniqueTournament;
	priority: number;
	isLive: boolean;
	id: number;
}

export interface Category {
	name: string;
	slug: string;
	sport: Sport;
	id: number;
	flag: string;
	alpha2?: string;
}

export interface Sport {
	name: string;
	slug: string;
	id: number;
}

export interface UniqueTournament {
	name: string;
	slug: string;
	primaryColorHex?: string;
	secondaryColorHex: string;
	category: Category;
	userCount: number;
	crowdsourcingEnabled: boolean;
	hasPerformanceGraphFeature: boolean;
	id: number;
	hasEventPlayerStatistics: boolean;
	displayInverseHomeAwayTeams: boolean;
}

export interface Season {
	name: string;
	year: string;
	editor: boolean;
	id: number;
	seasonCoverageInfo?: SeasonCoverageInfo;
}

export type SeasonCoverageInfo = Record<string, string>;
