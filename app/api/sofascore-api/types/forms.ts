export interface LeagueForm {
	events: TeamEvent[];
	hasNextPage: boolean;
}

export interface TeamEvent {
	tournament: Tournament;
	customId: string;
	status: Status;
	winnerCode: number;
	homeTeam: Team;
	awayTeam: Team;
	homeScore: Score;
	awayScore: Score;
	hasXg: boolean;
	id: number;
	startTimestamp: number;
	slug: string;
	finalResultOnly: boolean;
}

export interface Score {
	current: number;
	display: number;
	period1: number;
	period2: number;
	normaltime: number;
}

export interface Team {
	name: string;
	slug: string;
	shortName: string;
	gender: Gender;
	sport: Sport;
	userCount: number;
	nameCode: string;
	disabled: boolean;
	national: boolean;
	type: number;
	id: number;
	teamColors: TeamColors;
	fieldTranslations: FieldTranslations;
}

export interface FieldTranslations {
	nameTranslation: NameTranslation;
	shortNameTranslation: ShortNameTranslation;
}

export interface NameTranslation {
	ar: string;
}

export type ShortNameTranslation = Record<string, string>;

export type Gender = "M";

export interface Sport {
	name: SportName;
	slug: SportSlug;
	id: number;
}

export type SportName = "Football";

export type SportSlug = "football";

export interface TeamColors {
	primary: string;
	secondary: string;
	text: string;
}

export interface Status {
	code: number;
	description: Description;
	type: Type;
}

export type Description = "Ended";

export type Type = "finished";

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
	alpha2: string;
}

export interface UniqueTournament {
	name: string;
	slug: string;
	primaryColorHex: string;
	secondaryColorHex: string;
	category: Category;
	userCount: number;
	id: number;
	displayInverseHomeAwayTeams: boolean;
}
