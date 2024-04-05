export type Standings = {
	standings: Array<{
		tournament: {
			name: string;
			slug: string;
			category: {
				name: string;
				slug: string;
				sport: {
					name: string;
					slug: string;
					id: number;
				};
				id: number;
				flag: string;
				alpha2: string;
			};
			uniqueTournament: {
				name: string;
				slug: string;
				primaryColorHex: string;
				secondaryColorHex: string;
				category: {
					name: string;
					slug: string;
					sport: {
						name: string;
						slug: string;
						id: number;
					};
					id: number;
					flag: string;
					alpha2: string;
				};
				userCount: number;
				id: number;
				hasPerformanceGraphFeature: boolean;
				displayInverseHomeAwayTeams: boolean;
			};
			priority: number;
			isLive: boolean;
			id: number;
		};
		type: string;
		name: string;
		descriptions: Array<any>;
		tieBreakingRule: {
			text: string;
			id: number;
		};
		rows: Array<{
			team: {
				name: string;
				slug: string;
				shortName: string;
				gender: string;
				sport: {
					name: string;
					slug: string;
					id: number;
				};
				userCount: number;
				nameCode: string;
				disabled: boolean;
				national: boolean;
				type: number;
				id: number;
				teamColors: {
					primary: string;
					secondary: string;
					text: string;
				};
				fieldTranslations: {
					nameTranslation: {
						ar: string;
					};
					shortNameTranslation: {};
				};
			};
			descriptions: Array<{
				text: string;
				id: number;
			}>;
			promotion?: {
				text: string;
				id: number;
			};
			position: number;
			matches: number;
			wins: number;
			scoresFor: number;
			scoresAgainst: number;
			id: number;
			losses: number;
			draws: number;
			points: number;
		}>;
		id: number;
		updatedAtTimestamp: number;
	}>;
};
