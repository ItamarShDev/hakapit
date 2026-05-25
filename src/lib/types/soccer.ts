export interface League {
	filters: { season: string };
	area: { id: number; name: string; code: string; flag: string };
	competition: Competition;
	season: {
		id: number;
		startDate: string;
		endDate: string;
		currentMatchday: number;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		winner: any;
		stages: string[];
	};
	standings: Standing[];
}

export interface Competition {
	id: number;
	name: string;
	code: string;
	type: string;
	emblem: string;
}

export interface Standing {
	stage: string;
	type: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	group: any;
	table: TableEntry[];
}

export interface TableEntry {
	position: number;
	team: Team;
	playedGames: number;
	form: string;
	won: number;
	draw: number;
	lost: number;
	points: number;
	goalsFor: number;
	goalsAgainst: number;
	goalDifference: number;
}

export interface Team {
	id: number;
	name: string;
	shortName: string;
	tla: string;
	crest: string;
}

export interface TeamData {
	area: { id: number; name: string; code: string; flag: string };
	id: number;
	name: string;
	shortName: string;
	tla: string;
	crest: string;
	address: string;
	website: string;
	founded: number;
	clubColors: string;
	venue: string;
	runningCompetitions: RunningCompetition[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	coach: any;
	marketValue: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	squad: any[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	staff: any[];
	lastUpdated: string;
}

export interface RunningCompetition {
	id: number;
	name: string;
	code: string;
	type: string;
	emblem: string;
}

export interface TeamMatches {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	filters: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	resultSet: any;
	matches: Match[];
}

export interface Match {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	area: any;
	competition: Competition;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	season: any;
	id: number;
	utcDate: string;
	status: string;
	matchday: number;
	stage: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	group: any;
	lastUpdated: string;
	homeTeam: Team;
	awayTeam: Team;
	score: Score;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	odds: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	referees: any[];
}

export interface Score {
	winner?: string | null;
	duration: string;
	fullTime: { home?: number | null; away?: number | null };
	halfTime: { home?: number | null; away?: number | null };
}

export interface Transfer {
	_id: string;
	playerId: number;
	playerName: string;
	playerPhoto?: string;
	date: number;
	teamId: number;
	teamName: string;
	teamLogo?: string;
	type?: string;
	direction: string;
	action: string;
	price?: string;
	updatedAt: number;
}

export const LiverpoolId = 64;

export interface NextMatchData {
	matchDetails: Match | undefined;
	awayForm?: Match[];
	homeForm?: Match[];
}

export interface SoccerSnapshot {
	team: TeamData | null;
	leaguesData: Array<{ leagueId: string; league: League }>;
	nextMatchData: NextMatchData | null;
}
