export interface SportsDBTeamResponse {
	teams: SportsDBTeam[];
}

export interface SportsDBTeam {
	idTeam: string;
	strTeam: string;
	strTeamAlternate: string;
	strTeamShort: string;
	intFormedYear: string;
	strSport: string;
	strLeague: string;
	idLeague: string;
	strBadge: string;
	strLogo: string;
}

export interface SportsDBPlayersResponse {
	player: SportsDBPlayer[];
}

export interface SportsDBPlayer {
	idPlayer: string;
	idTeam: string;
	strPlayer: string;
	strTeam: string;
	strPosition: string;
	strThumb: string;
	strCutout: string;
	strRender: string;
	dateBorn: string;
	strNationality: string;
}

export interface SportsDBFormerTeamsResponse {
	formerteams: SportsDBFormerTeam[];
}

export interface SportsDBFormerTeam {
	id: string;
	idPlayer: string;
	idFormerTeam: string;
	strPlayer: string;
	strFormerTeam: string;
	strMoveType: string;
	strJoined: string;
	strDeparted: string;
	strBadge: string;
}
