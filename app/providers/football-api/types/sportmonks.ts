export interface SportMonksTeamTransfersResponse {
	data: Transfer[];
	pagination: Pagination;
	subscription: Subscription[];
	rate_limit: RateLimit;
	timezone: string;
}

export interface Transfer {
	id: number;
	sport_id: number;
	player_id: number;
	type_id: number;
	from_team_id: number;
	to_team_id: number;
	position_id: number;
	detailed_position_id?: number;
	date: string;
	career_ended: boolean;
	completed: boolean;
	amount?: number;
	fromteam: FromTeam;
	player: Player;
	type: Type;
	position: Position;
	detailedposition?: DetailedPosition;
}

export interface FromTeam {
	id: number;
	sport_id: number;
	country_id: number;
	venue_id: number;
	gender: string;
	name: string;
	short_code: string;
	image_path: string;
	founded: number;
	type: string;
	placeholder: boolean;
	last_played_at: string;
}

export interface Player {
	id: number;
	sport_id: number;
	country_id: number;
	nationality_id: number;
	city_id?: number;
	position_id: number;
	detailed_position_id: number;
	type_id: number;
	common_name: string;
	firstname: string;
	lastname: string;
	name: string;
	display_name: string;
	image_path: string;
	height: number;
	weight?: number;
	date_of_birth: string;
	gender: string;
}

export interface Type {
	id: number;
	name: string;
	code: string;
	developer_name: string;
	model_type: string;
	stat_group: any;
}

export interface Position {
	id: number;
	name: string;
	code: string;
	developer_name: string;
	model_type: string;
	stat_group: any;
}

export interface DetailedPosition {
	id: number;
	name: string;
	code: string;
	developer_name: string;
	model_type: string;
	stat_group: any;
}

export interface Pagination {
	count: number;
	per_page: number;
	current_page: number;
	next_page: any;
	has_more: boolean;
}

export interface Subscription {
	meta: any[];
	plans: Plan[];
	add_ons: any[];
	widgets: any[];
}

export interface Plan {
	plan: string;
	sport: string;
	category: string;
}

export interface RateLimit {
	resets_in_seconds: number;
	remaining: number;
	requested_entity: string;
}
