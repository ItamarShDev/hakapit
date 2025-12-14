export interface TransferResponse {
	get: string;
	parameters: Parameters;
	// biome-ignore lint/suspicious/noExplicitAny: false positive
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
	player: string;
}

export interface Response {
	player: Player;
	update: Date;
	transfers: Transfer[];
}

export interface Player {
	id: number;
	name: string;
}

export interface Transfer {
	date: Date;
	type: null | string;
	teams: Teams;
}

export interface Teams {
	in: In;
	out: In;
}

export interface In {
	id: number;
	name: string;
	logo: string;
}
