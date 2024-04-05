export interface Head2Head {
	events: Event[];
}

export interface Event {
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
	winnerCode?: number;
	hasXg?: boolean;
	hasEventPlayerStatistics?: boolean;
	hasEventPlayerHeatMap?: boolean;
	coverage?: number;
	homeRedCards?: number;
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
	alpha2: string;
}

export interface Sport {
	name: string;
	slug: string;
	id: number;
}

export interface Country {
	alpha2: string;
	alpha3: string;
	name: string;
}

export interface UniqueTournament {
	name: string;
	slug: string;
	primaryColorHex: string;
	secondaryColorHex: string;
	category: Category;
	userCount: number;
	id: number;
	country: Country;
	hasEventPlayerStatistics: boolean;
	crowdsourcingEnabled: boolean;
	hasPerformanceGraphFeature: boolean;
	displayInverseHomeAwayTeams: boolean;
}

export interface Season {
	name: string;
	year: string;
	editor: boolean;
	id: number;
	seasonCoverageInfo?: SeasonCoverageInfo;
}

export type SeasonCoverageInfo = {};

export interface RoundInfo {
	round: number;
	name?: string;
	slug?: string;
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
	subTeams: any[];
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

export type ShortNameTranslation = {};

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
	subTeams: any[];
	teamColors: TeamColors;
	fieldTranslations: FieldTranslations;
}

ß;
export interface HomeScore {
	current?: number;
	display?: number;
	period1?: number;
	period2?: number;
	normaltime?: number;
}

export interface AwayScore {
	current?: number;
	display?: number;
	period1?: number;
	period2?: number;
	normaltime?: number;
}

export interface Time {
	injuryTime1?: number;
	injuryTime2?: number;
	currentPeriodStartTimestamp?: number;
}

export interface Changes {
	changeTimestamp: number;
	changes?: string[];
}
