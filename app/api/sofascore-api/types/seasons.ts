export interface Seasons {
	uniqueTournamentSeasons: UniqueTournamentSeason[];
	typesMap: TypesMap;
}

export interface UniqueTournamentSeason {
	uniqueTournament: UniqueTournament;
	seasons: Season[];
}

export interface UniqueTournament {
	name: string;
	slug: string;
	primaryColorHex?: string;
	secondaryColorHex: string;
	category: Category;
	userCount: number;
	id: number;
	displayInverseHomeAwayTeams: boolean;
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

export interface Season {
	name: string;
	year: string;
	editor: boolean;
	id: number;
	seasonCoverageInfo?: SeasonCoverageInfo;
}

export type SeasonCoverageInfo = Record<string, string>;

export interface TypesMap {
	[types: string]: Record<string, string[]>;
}
