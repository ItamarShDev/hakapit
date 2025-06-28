export interface TeamMatches {
	filters: Filters;
	resultSet: ResultSet;
	matches: Match[];
}

export interface Filters {
	competitions: string;
	permission: string;
	limit: number;
}

export interface ResultSet {
	count: number;
	competitions: string;
	first: string;
	last: string;
	played: number;
	wins: number;
	draws: number;
	losses: number;
}

export interface Match {
	area: Area;
	competition: Competition;
	season: Season;
	id: number;
	utcDate: string;
	status: string;
	matchday: number;
	stage: string;
	// biome-ignore lint/suspicious/noExplicitAny: false positive
	group: any;
	lastUpdated: string;
	homeTeam: HomeTeam;
	awayTeam: Team;
	score: Score;
	odds: Odds;
	referees: Referee[];
}

export interface Area {
	id: number;
	name: string;
	code: string;
	flag: string;
}

export interface Competition {
	id: number;
	name: string;
	code: string;
	type: string;
	emblem: string;
}

export interface Season {
	id: number;
	startDate: string;
	endDate: string;
	currentMatchday: number;
	// biome-ignore lint/suspicious/noExplicitAny: false positive
	winner: any;
}

export interface HomeTeam {
	id: number;
	name: string;
	shortName: string;
	tla: string;
	crest: string;
}

export interface Team {
	id: number;
	name: string;
	shortName: string;
	tla: string;
	crest: string;
}

export interface Score {
	winner?: string;
	duration: string;
	fullTime: FullTime;
	halfTime: HalfTime;
}

export interface FullTime {
	home?: number;
	away?: number;
}

export interface HalfTime {
	home?: number;
	away?: number;
}

export interface Odds {
	msg: string;
}

export interface Referee {
	id: number;
	name: string;
	type: string;
	nationality: string;
}
