import got from "got";
import { CastingError } from "./type-cast-error";
import type { League } from "./types/league";
import { Convert as ConvertLeague } from "./types/league";
import {
	Convert as ConvertMatchDetails,
	type MatchDetails,
} from "./types/match-details";
import { Convert as ConvertMatches, type Matches } from "./types/matches";
import { Convert as ConvertPlayer, type Player } from "./types/player";
import type { Team } from "./types/team";
import { Convert as ConvertTeam } from "./types/team";

const baseUrl = "https://www.fotmob.com/api";

class Fotmob {
	matchesUrl: string;
	leaguesUrl: string;
	teamsUrl: string;
	teamsSeasonStatsUrl: string;
	playerUrl: string;
	matchDetailsUrl: string;
	searchUrl: string;
	map = new Map();

	constructor() {
		this.matchesUrl = `${baseUrl}/matches?`;
		this.leaguesUrl = `${baseUrl}/leagues?`;
		this.teamsUrl = `${baseUrl}/teams?`;
		this.teamsSeasonStatsUrl = `${baseUrl}/teamseasonstats?`;
		this.playerUrl = `${baseUrl}/playerData?`;
		this.matchDetailsUrl = `${baseUrl}/matchDetails?`;
		this.searchUrl = `${baseUrl}/searchapi/`;
	}

	checkDate(date: string) {
		const re = /(20\d{2})(\d{2})(\d{2})/;
		return re.exec(date);
	}
	async safeTypeCastFetch<T>(url: string, fn: (data: string) => T) {
		const res = await got(url, { cache: this.map });
		try {
			return fn(res.body) as T;
		} catch (err) {
			if (err instanceof CastingError) {
				return JSON.parse(res.body) as Record<string, unknown>;
			}
			throw err;
		}
	}

	async getMatchesByDate(date: string) {
		if (this.checkDate(date) != null) {
			const url = this.matchesUrl + `date=${date}`;
			return await this.safeTypeCastFetch<Matches>(
				url,
				ConvertMatches.toMatches,
			);
		}
	}

	async getLeague(
		id: number,
		tab = "overview",
		type = "league",
		timeZone = "America/New_York",
	) {
		const url =
			this.leaguesUrl + `id=${id}&tab=${tab}&type=${type}&timeZone=${timeZone}`;
		return await this.safeTypeCastFetch<League>(url, ConvertLeague.toLeague);
	}

	async getTeam(
		id: number,
		tab = "overview",
		type = "team",
		timeZone = "America/New_York",
	) {
		const url =
			this.teamsUrl + `id=${id}&tab=${tab}&type=${type}&timeZone=${timeZone}`;
		return await this.safeTypeCastFetch<Team>(url, ConvertTeam.toTeam);
	}
	async getTeamSeasonStats(id: number, seasonId: number) {
		const url =
			this.teamsSeasonStatsUrl + `teamId=${id}&tournamentId=${seasonId}`;
		const res = await got(url, { cache: this.map });
		return JSON.parse(res.body) as Record<string, unknown>;
	}

	async getPlayer(id: number) {
		const url = this.playerUrl + `id=${id}`;
		return await this.safeTypeCastFetch<Player>(url, ConvertPlayer.toPlayer);
	}

	async getMatchDetails(matchId: number) {
		const url = this.matchDetailsUrl + `matchId=${matchId}`;
		return await this.safeTypeCastFetch<MatchDetails>(
			url,
			ConvertMatchDetails.toMatchDetails,
		);
	}
}

export default Fotmob;
