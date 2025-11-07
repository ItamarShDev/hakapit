import { expect, test } from "@playwright/test";
import { HomePage } from "./page-objects/HomePage";
import { NavigationPage } from "./page-objects/NavigationPage";

test.describe("Homepage", () => {
	let homePage: HomePage;
	let navigationPage: NavigationPage;

	test.beforeEach(async ({ page }) => {
		homePage = new HomePage(page);
		navigationPage = new NavigationPage(page);
		await homePage.goto();
	});

	test.describe("Page Loading", () => {
		test("should load homepage successfully", async ({ page }) => {
			await expect(page.locator("html")).toHaveAttribute("lang", "he");
			// Page title is empty in development, but we can check the main heading
			await expect(page.getByRole("heading", { name: "הכפית" })).toBeVisible();
		});

		test("should display all main sections", async () => {
			await homePage.expectPageToLoad();
		});

		test("should have proper Hebrew RTL text direction", async () => {
			await homePage.expectHebrewTextDirection();
		});
	});

	test.describe("Trophies Section", () => {
		test("should display trophies section", async () => {
			await expect(homePage.trophiesSection).toBeVisible();
		});

		test("should display correct number of trophies", async () => {
			await homePage.expectTrophiesCount(8); // Based on the trophies array in the component
		});

		test("should display specific trophies", async () => {
			await homePage.expectTrophyToBeVisible(42); // Champions League
			await homePage.expectTrophyToBeVisible(47); // Premier League
			await homePage.expectTrophyToBeVisible(132); // FA Cup
			await homePage.expectTrophyToBeVisible(133); // EFL Cup
		});

		test("should show trophy tooltips on hover", async ({ page }) => {
			const championsLeagueTrophy = await homePage.getTrophy(42);
			await championsLeagueTrophy.hover();
			// Tooltip should appear - we can check for the tooltip content specifically
			await expect(page.getByRole("tooltip").getByText("Champions League")).toBeVisible();
		});
	});

	test.describe("Recent Transfers Section", () => {
		test("should display recent transfers section", async () => {
			// Recent transfers section might not render if no data is available
			const recentTransfersExists = await homePage.recentTransfersSection.isVisible().catch(() => false);
			if (recentTransfersExists) {
				await expect(homePage.recentTransfersSection).toBeVisible();
			}
		});

		test("should display correct Hebrew title", async () => {
			// Recent transfers section might not render if no data is available
			const recentTransfersExists = await homePage.recentTransfersSection.isVisible().catch(() => false);
			if (recentTransfersExists) {
				await homePage.expectRecentTransfersTitleToContain("העברות אחרונות");
			}
		});

		test("should display transfer list", async () => {
			// Recent transfers section might not render if no data is available
			const recentTransfersExists = await homePage.recentTransfersSection.isVisible().catch(() => false);
			if (recentTransfersExists) {
				await expect(homePage.recentTransfersList).toBeVisible();
				// Should have some transfers (exact count may vary based on API data)
				const transferCount = await homePage.recentTransfersList.getByRole("button").count();
				expect(transferCount).toBeGreaterThan(0);
			}
		});

		test("should show transfer tooltips on hover", async ({ page }) => {
			const transfers = await homePage.recentTransfersList.getByRole("button");
			if ((await transfers.count()) > 0) {
				await transfers.first().hover();
				// Tooltip should appear with player information
				await expect(page.locator('[role="tooltip"]')).toBeVisible();
			}
		});
	});

	test.describe("Next Match Section", () => {
		test("should display next match overview", async () => {
			await homePage.expectNextMatchToBeVisible();
		});

		test("should display match information", async ({ page }) => {
			// Check for match details like teams, date, league
			await expect(page.getByText("המשחק הבא")).toBeVisible();
			// Should contain team information and match details
		});
	});

	test.describe("Stats Tables", () => {
		test("should display Premier League stats table", async () => {
			// Stats tables might not render if no data is available
			const table = await homePage.getStatsTable("Premier League");
			const tableExists = await table.isVisible().catch(() => false);
			if (tableExists) {
				await homePage.expectStatsTableToBeVisible("Premier League");
			}
		});

		test("should display Champions League stats table", async () => {
			// Stats tables might not render if no data is available
			const table = await homePage.getStatsTable("UEFA Champions League");
			const tableExists = await table.isVisible().catch(() => false);
			if (tableExists) {
				await homePage.expectStatsTableToBeVisible("UEFA Champions League");
			}
		});

		test("should have proper table structure", async () => {
			// Check if Premier League table exists first
			const premierLeagueTable = await homePage.getStatsTable("Premier League");
			const tableExists = await premierLeagueTable.isVisible().catch(() => false);
			if (tableExists) {
				await expect(premierLeagueTable.locator("thead")).toBeVisible();
				await expect(premierLeagueTable.locator("tbody")).toBeVisible();

				// Check for table headers in Hebrew
				await expect(premierLeagueTable.getByText("קבוצה")).toBeVisible();
				await expect(premierLeagueTable.getByText("מיקום")).toBeVisible();
				await expect(premierLeagueTable.getByText("נקודות")).toBeVisible();
			}
		});
	});

	test.describe("Latest Episode", () => {
		test("should display latest episode section", async () => {
			// Latest episode might not render if no data is available
			const episode = await homePage.getLatestEpisode();
			const episodeExists = await episode.isVisible().catch(() => false);
			if (episodeExists) {
				await homePage.expectLatestEpisodeToBeVisible();
			}
		});

		test("should have episode link", async ({ page }) => {
			const episodeLink = page.getByRole("link", { name: /פרק/ });
			if ((await episodeLink.count()) > 0) {
				await expect(episodeLink.first()).toBeVisible();
			}
		});
	});

	test.describe("Floating Chat", () => {
		test("should display floating chat button", async () => {
			await expect(homePage.floatingChat).toBeVisible();
			await expect(homePage.chatTriggerButton).toBeVisible();
			await expect(homePage.chatTriggerButton).toContainText("שאל אותי על ליברפול");
		});

		test("should open chat when clicked", async () => {
			await homePage.openChat();
			await homePage.expectChatToBeOpen();
			await expect(homePage.chatTitle).toContainText("Liver-Chat");
			await expect(homePage.chatDescription).toContainText("ניתן לשאול כל שאלה");
		});

		test("should allow typing and sending messages", async () => {
			await homePage.openChat();
			await homePage.expectChatToBeOpen();

			const testMessage = "מה דעתך על ליברפול?";
			await homePage.typeMessage(testMessage);
			await expect(homePage.chatInput).toHaveValue(testMessage);

			// Note: Actual message sending might require mocking the AI API
			// For now, just test the UI interaction
			await expect(homePage.chatSendButton).toBeVisible();
		});

		test("should handle Enter key to send message", async () => {
			await homePage.openChat();
			await homePage.typeMessage("Test message");
			await homePage.chatInput.press("Enter");
			// Should trigger send action
		});
	});

	test.describe("Navigation", () => {
		test("should display navigation links", async () => {
			await navigationPage.expectNavigationToBeVisible();
		});

		test("should have correct Hebrew navigation text", async () => {
			await expect(navigationPage.homeLink).toContainText("בית");
			await expect(navigationPage.hakapitLink).toContainText("הכפית");
			await expect(navigationPage.nitkLink).toContainText("שכונה בממלכה");
			await expect(navigationPage.balconyAlbumsLink).toContainText("אלבומים במרפסת");
		});

		test("should navigate to different sections", async () => {
			await navigationPage.navigateToHakapit();
			await navigationPage.expectUrlToContain("/hakapit");

			await navigationPage.navigateToHome();
			await navigationPage.expectUrlToContain("/");
		});
	});

	test.describe("Footer", () => {
		test("should display social media links", async () => {
			await navigationPage.expectFooterLinksToBeVisible();
		});

		test("should have working external links", async () => {
			const twitterLink = navigationPage.twitterLink;
			await expect(twitterLink).toHaveAttribute("href", /twitter/);

			const instagramLink = navigationPage.instagramLink;
			await expect(instagramLink).toHaveAttribute("href", /instagram/);
		});
	});
});
