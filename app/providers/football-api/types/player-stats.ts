export interface PlayerStatsResponse {
	get: string;
	parameters: Parameters;
	errors: any[];
	results: number;
	paging: Paging;
	response: Response[];
}

export interface Paging {
	current: number;
	total: number;
}

export interface Parameters {
	id: string;
	season: string;
}

export interface Response {
	player: Player;
	statistics: Statistic[];
}

export interface Player {
	id: number;
	name: string;
	firstname: string;
	lastname: string;
	age: number;
	birth: Birth;
	nationality: string;
	height: string;
	weight: string;
	injured: boolean;
	photo: string;
}

export interface Birth {
	date: Date;
	place: string;
	country: string;
}

export interface Statistic {
	team: Team;
	league: League;
	games: Games;
	substitutes: Substitutes;
	shots: Shots;
	goals: Goals;
	passes: Passes;
	tackles: Tackles;
	duels: Duels;
	dribbles: Dribbles;
	fouls: Fouls;
	cards: Cards;
	penalty: Penalty;
}

export interface Cards {
	yellow: number;
	yellowred: number;
	red: number;
}

export interface Dribbles {
	attempts: number;
	success: number;
	past: null;
}

export interface Duels {
	total: null;
	won: null;
}

export interface Fouls {
	drawn: number;
	committed: number;
}

export interface Games {
	appearences: number;
	lineups: number;
	minutes: number;
	number: null;
	position: string;
	rating: string;
	captain: boolean;
}

export interface Goals {
	total: number;
	conceded: null;
	assists: number;
	saves: number;
}

export interface League {
	id: number;
	name: string;
	country: string;
	logo: string;
	flag: string;
	season: number;
}

export interface Passes {
	total: number;
	key: number;
	accuracy: number;
}

export interface Penalty {
	won: number;
	commited: null;
	scored: number;
	missed: number;
	saved: null;
}

export interface Shots {
	total: number;
	on: number;
}

export interface Substitutes {
	in: number;
	out: number;
	bench: number;
}

export interface Tackles {
	total: number;
	blocks: number;
	interceptions: number;
}

export interface Team {
	id: number;
	name: string;
	logo: string;
}
