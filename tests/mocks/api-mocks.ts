import type { Page, Route } from "@playwright/test";

// Mock data for Sportmonks API
const mockTransferData = [
	{
		playerId: 1,
		playerName: "מוחמד סלאח",
		playerPhoto: "https://example.com/salah.jpg",
		teamName: "ליברפול",
		date: "2025-01-15",
		type: "buy",
	},
	{
		playerId: 2,
		playerName: "וירג'יל ון דייק",
		playerPhoto: "https://example.com/vandijk.jpg",
		teamName: "ליברפול",
		date: "2025-01-10",
		type: "buy",
	},
	{
		playerId: 3,
		playerName: "דומיניק סובוסלאי",
		playerPhoto: "https://example.com/szoboszlai.jpg",
		teamName: "ליברפול",
		date: "2025-01-05",
		type: "buy",
	},
];

const mockNextMatchData = {
	id: 12345,
	homeTeam: {
		id: 85,
		name: "Real Madrid CF",
		shortName: "Real Madrid",
		logo: "https://example.com/real-madrid.png",
	},
	awayTeam: {
		id: 40,
		name: "Liverpool FC",
		shortName: "Liverpool",
		logo: "https://example.com/liverpool.png",
	},
	competition: {
		id: 2,
		name: "UEFA Champions League",
		logo: "https://example.com/ucl.png",
	},
	date: "2025-11-04T22:00:00Z",
	status: "NS",
	homeTeamForm: ["L", "W", "L", "L", "L"],
	awayTeamForm: ["L", "L", "W", "L", "W"],
};

const mockStatsData = {
	premierLeague: [
		{
			position: 1,
			team: {
				id: 42,
				name: "Manchester City",
				shortName: "Man City",
				logo: "https://example.com/man-city.png",
			},
			points: 20,
			played: 9,
			form: "W-W-W-W-W",
			goalsFor: 21,
			goalsAgainst: 9,
		},
		{
			position: 2,
			team: {
				id: 62,
				name: "Bournemouth",
				shortName: "Bournemouth",
				logo: "https://example.com/bournemouth.png",
			},
			points: 18,
			played: 9,
			form: "W-W-L-W-W",
			goalsFor: 16,
			goalsAgainst: 11,
		},
		{
			position: 3,
			team: {
				id: 40,
				name: "Liverpool FC",
				shortName: "Liverpool",
				logo: "https://example.com/liverpool.png",
			},
			points: 18,
			played: 10,
			form: "L-W-L-L-W",
			goalsFor: 18,
			goalsAgainst: 14,
		},
	],
	championsLeague: [
		{
			position: 9,
			team: {
				id: 81,
				name: "FC Barcelona",
				shortName: "Barça",
				logo: "https://example.com/barcelona.png",
			},
			points: 6,
			played: 3,
			form: "W-L-W",
			goalsFor: 9,
			goalsAgainst: 4,
		},
		{
			position: 10,
			team: {
				id: 40,
				name: "Liverpool FC",
				shortName: "Liverpool",
				logo: "https://example.com/liverpool.png",
			},
			points: 6,
			played: 3,
			form: "L-W-L",
			goalsFor: 8,
			goalsAgainst: 4,
		},
		{
			position: 11,
			team: {
				id: 61,
				name: "Chelsea FC",
				shortName: "Chelsea",
				logo: "https://example.com/chelsea.png",
			},
			points: 6,
			played: 3,
			form: "W-L-L",
			goalsFor: 7,
			goalsAgainst: 4,
		},
	],
};

const mockEpisodeData = {
	id: 299,
	title: "פרק 299 - מה מתסכל? אנחנו נגיד לכם מה מתסכל",
	description: "הפרק האחרון בסדרה",
	pubDate: "2025-10-21T10:00:00Z",
	audioUrl: "https://example.com/episode-299.mp3",
	duration: "45:30",
	podcast: "hakapit",
};

// Mock AI chat responses
const mockAIResponses = {
	"מה דעתך על ליברפול?":
		"ליברפול היא קבוצה מצוינת עם היסטוריה עשירה ואוהדים נלהבים. הקבוצה הציגה יכולת טובה בעונה האחרונה וממשיכה להיות פקטור חשוב בכדורגל האירופי.",
	ליברפול:
		"ליברפול היא אחת הקבוצות המוצלחות ביותר בהיסטוריה של הכדורגל האנגלי, עם 19 אליפויות פרמייר ליג ו-6 גביעי אירופה/ליגת האלופות.",
	שלום: "שלום! אני כאן לענות על כל השאלות שלך על ליברפול ועל עולם הכדורגל. מה תרצה לדעת?",
	default: "זו שאלה מעניינת! אני ממליץ לבדוק את האתר הרשמי של ליברפול או לעקוב אחר החדשות האחרונות על הקבוצה.",
};

// Mock response helper
function createMockResponse(data: any, status = 200) {
	return {
		status,
		contentType: "application/json",
		body: JSON.stringify(data),
	};
}

// API mocking functions
export async function mockTransferAPI(page: Page) {
	await page.route("**/api/transfers", (route: Route) => {
		route.fulfill(createMockResponse(mockTransferData));
	});
}

export async function mockNextMatchAPI(page: Page) {
	await page.route("**/api/next-match", (route: Route) => {
		route.fulfill(createMockResponse(mockNextMatchData));
	});
}

export async function mockStatsAPI(page: Page) {
	await page.route("**/api/stats/**", (route: Route) => {
		const url = route.request().url();

		if (url.includes("premier-league")) {
			route.fulfill(createMockResponse(mockStatsData.premierLeague));
		} else if (url.includes("champions-league")) {
			route.fulfill(createMockResponse(mockStatsData.championsLeague));
		} else {
			route.fulfill(createMockResponse(mockStatsData));
		}
	});
}

export async function mockRSSFeedAPI(page: Page) {
	await page.route("**/api/rss/**", (route: Route) => {
		route.fulfill(createMockResponse(mockEpisodeData));
	});
}

export async function mockAIChatAPI(page: Page) {
	await page.route("**/api/chat", async (route: Route) => {
		const postData = await route.request().postData();
		let message = "";

		if (postData) {
			try {
				const parsed = JSON.parse(postData);
				message = parsed.messages?.[parsed.messages.length - 1]?.content || "";
			} catch (e) {
				console.error("Failed to parse chat request:", e);
			}
		}

		// Find matching response or use default
		const response = mockAIResponses[message as keyof typeof mockAIResponses] || mockAIResponses.default;

		// Simulate streaming response
		route.fulfill({
			status: 200,
			contentType: "text/plain; charset=utf-8",
			body: response,
		});
	});
}

// Mock all APIs
export async function mockAllAPIs(page: Page) {
	await mockTransferAPI(page);
	await mockNextMatchAPI(page);
	await mockStatsAPI(page);
	await mockRSSFeedAPI(page);
	await mockAIChatAPI(page);
}

// Mock external image sources
export async function mockExternalImages(page: Page) {
	await page.route("**/images.fotmob.com/**", (route: Route) => {
		// Return a placeholder image or mock response
		route.fulfill({
			status: 200,
			contentType: "image/png",
			body: Buffer.from(
				"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
				"base64",
			),
		});
	});

	await page.route("**/example.com/**", (route: Route) => {
		route.fulfill({
			status: 200,
			contentType: "image/png",
			body: Buffer.from(
				"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
				"base64",
			),
		});
	});
}

// Error simulation for testing error states
export async function mockAPIErrors(page: Page) {
	await page.route("**/api/transfers", (route: Route) => {
		route.fulfill({
			status: 500,
			contentType: "application/json",
			body: JSON.stringify({ error: "Internal server error" }),
		});
	});

	await page.route("**/api/next-match", (route: Route) => {
		route.fulfill({
			status: 404,
			contentType: "application/json",
			body: JSON.stringify({ error: "Match not found" }),
		});
	});
}

// Slow response simulation for testing loading states
export async function mockSlowAPIs(page: Page, delay = 2000) {
	await page.route("**/api/**", async (route: Route) => {
		await new Promise((resolve) => setTimeout(resolve, delay));

		// Let some routes through to normal handling
		const url = route.request().url();
		if (url.includes("/api/transfers")) {
			route.fulfill(createMockResponse(mockTransferData));
		} else if (url.includes("/api/next-match")) {
			route.fulfill(createMockResponse(mockNextMatchData));
		} else {
			route.continue();
		}
	});
}

// Empty data simulation for testing empty states
export async function mockEmptyData(page: Page) {
	await page.route("**/api/transfers", (route: Route) => {
		route.fulfill(createMockResponse([]));
	});

	await page.route("**/api/next-match", (route: Route) => {
		route.fulfill(createMockResponse(null));
	});

	await page.route("**/api/stats/**", (route: Route) => {
		route.fulfill(createMockResponse([]));
	});
}

// Network offline simulation
export async function mockOfflineMode(page: Page) {
	await page.context().setOffline(true);
}

// Utility function to wait for API calls
export async function waitForAPICalls(page: Page) {
	await page.waitForLoadState("networkidle");
}

// Export mock data for use in tests
export { mockTransferData, mockNextMatchData, mockStatsData, mockEpisodeData, mockAIResponses };
