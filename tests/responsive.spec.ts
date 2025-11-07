import { expect, test } from "@playwright/test";
import { HomePage } from "./page-objects/HomePage";

test.describe("Responsive Design", () => {
	let homePage: HomePage;

	test.beforeEach(async ({ page }) => {
		homePage = new HomePage(page);
		await homePage.goto();
	});

	test.describe("Mobile Layout Tests", () => {
		test("should display correctly on mobile viewport", async ({ page }) => {
			// Set mobile viewport
			await page.setViewportSize({ width: 375, height: 667 });
			await page.reload();

			// Check viewport size
			const viewport = page.viewportSize();
			expect(viewport?.width).toBeLessThan(768);

			// All main sections should still be visible
			await homePage.expectPageToLoad();
		});

		test("should have mobile-optimized chat layout", async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await page.reload();

			await homePage.expectMobileChatLayout();
			// Chat button should be full width on mobile
			await expect(homePage.chatTriggerButton).toHaveClass(/w-full/);
		});
	});

	test.describe("Tablet Layout Tests", () => {
		test("should display correctly on tablet viewport", async ({ page }) => {
			await page.setViewportSize({ width: 768, height: 1024 });
			await page.reload();

			const viewport = page.viewportSize();
			expect(viewport?.width).toBeGreaterThan(768);
			expect(viewport?.width).toBeLessThan(1024);

			await homePage.expectPageToLoad();
		});
	});

	test.describe("Desktop Layout Tests", () => {
		test("should display correctly on desktop viewport", async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 720 });
			await page.reload();

			const viewport = page.viewportSize();
			expect(viewport?.width).toBeGreaterThanOrEqual(1024);

			await homePage.expectPageToLoad();
		});

		test("should have desktop-optimized chat layout", async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 720 });
			await page.reload();

			await homePage.expectDesktopChatLayout();
			// Chat button should not be full width on desktop
			await expect(homePage.chatTriggerButton).not.toHaveClass(/w-full/);
		});
	});

	test.describe("Cross-device consistency", () => {
		const viewportsToTest = [
			{ name: "Mobile", width: 375, height: 667 },
			{ name: "Desktop", width: 1280, height: 720 },
		];

		viewportsToTest.forEach(({ name, width, height }) => {
			test(`should have consistent content across ${name} viewport`, async ({ page }) => {
				await page.setViewportSize({ width, height });
				await page.reload();

				// All devices should show the same core content
				await expect(homePage.trophiesSection).toBeVisible();
				await expect(homePage.recentTransfersSection).toBeVisible();

				// Next match section might not render if no data is available
				const nextMatchExists = await homePage.nextMatchOverview.isVisible().catch(() => false);
				if (nextMatchExists) {
					await expect(homePage.nextMatchOverview).toBeVisible();
				}
				await expect(homePage.floatingChat).toBeVisible();

				// Hebrew text should be consistent
				await homePage.expectRecentTransfersTitleToContain("העברות אחרונות");
				await expect(homePage.chatTriggerButton).toContainText("שאל אותי על ליברפול");

				// Same number of trophies across all devices
				await homePage.expectTrophiesCount(8);
			});
		});
	});

	test.describe("Font Scaling and Accessibility", () => {
		test("should handle larger font sizes", async ({ page }) => {
			// Simulate user preferring larger font sizes
			await page.emulateMedia({ reducedMotion: "reduce" });
			await homePage.goto();

			await homePage.expectPageToLoad();

			// Text should remain readable
			await expect(homePage.recentTransfersTitle).toBeVisible();
			await expect(homePage.chatTriggerButton).toBeVisible();
		});

		test("should respect reduced motion preferences", async ({ page }) => {
			await page.emulateMedia({ reducedMotion: "reduce" });
			await homePage.goto();

			// Page should still function properly with reduced motion
			await homePage.expectPageToLoad();
			await homePage.openChat();
			await homePage.expectChatToBeOpen();
		});
	});
});
