export interface NextGame {
	events: GameEvent[];
	hasNextPage: boolean;
}

export interface GameEvent {
	tournament: Tournament;
	season: Season;
	roundInfo: RoundInfo;
	customId: string;
	status: Status;
	homeTeam: HomeTeam;
	awayTeam: AwayTeam;
	homeScore: HomeScore;
	awayScore: AwayScore;
	time: Time;
	changes: Changes;
	hasGlobalHighlights: boolean;
	detailId?: number;
	crowdsourcingDataDisplayEnabled: boolean;
	id: number;
	crowdsourcingEnabled: boolean;
	startTimestamp: number;
	slug: string;
	finalResultOnly: boolean;
	isEditor: boolean;
	coverage?: number;
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
	country: Country;
	flag: string;
	alpha2?: string;
}

export interface Sport {
	name: string;
	slug: string;
	id: number;
}

export interface Country {
	alpha2?: string;
	name?: string;
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
	country: Country;
	hasEventPlayerStatistics: boolean;
	displayInverseHomeAwayTeams: boolean;
}

export interface Season {
	name: string;
	year: string;
	editor: boolean;
	id: number;
}

export interface RoundInfo {
	round: number;
	name?: string;
	slug?: string;
	cupRoundType?: number;
}

export interface Status {
	code: number;
	description: string;
	type: string;
}

export interface HomeTeam {
	name: string;
	slug: string;
	shortName: string;
	gender: string;
	sport: Sport;
	userCount: number;
	nameCode: string;
	disabled: boolean;
	national: boolean;
	type: number;
	id: number;
	country: Country;
	subTeams: never[];
	teamColors: TeamColors;
	fieldTranslations: FieldTranslations;
}

export interface TeamColors {
	primary: string;
	secondary: string;
	text: string;
}

export interface FieldTranslations {
	nameTranslation: NameTranslation;
	shortNameTranslation: ShortNameTranslation;
}

export interface NameTranslation {
	ar: string;
}

export type ShortNameTranslation = Record<string, string>;

export interface AwayTeam {
	name: string;
	slug: string;
	shortName: string;
	gender: string;
	sport: Sport;
	userCount: number;
	nameCode: string;
	disabled: boolean;
	national: boolean;
	type: number;
	id: number;
	country: Country;
	subTeams: never[];
	teamColors: TeamColors;
	fieldTranslations: FieldTranslations;
}

export interface NameTranslation2 {
	ar: string;
}

export type HomeScore = Record<string, string>;

export type AwayScore = Record<string, string>;

export type Time = Record<string, string>;

export interface Changes {
	changes?: string[];
	changeTimestamp: number;
}
