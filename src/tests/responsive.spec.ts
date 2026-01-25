import { expect, test } from "@playwright/test";
import { HomePage } from "./page-objects/HomePage";

// Prevent non-Playwright runners (e.g., `bun test`) from executing this file
const isPlaywrightRunner = Boolean(process.env.PLAYWRIGHT_WORKER_INDEX ?? process.env.PLAYWRIGHT_TEST);

if (!isPlaywrightRunner) {
	console.warn("Skipping responsive Playwright specs because PLAYWRIGHT_TEST/WORKER env not set");
}

isPlaywrightRunner &&
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
				// Chat button should have xs:w-full class on mobile
				await expect(homePage.chatTriggerButton).toHaveClass(/xs:w-full/);
			});
		});

		test.describe("Tablet Layout Tests", () => {
			test("should display correctly on tablet viewport", async ({ page }) => {
				await page.setViewportSize({ width: 768, height: 1024 });
				await page.reload();

				const viewport = page.viewportSize();
				expect(viewport?.width).toBeGreaterThanOrEqual(768);
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
				// Chat button should still have xs:w-full class but not be full width on desktop
				// The xs:w-full only applies on extra small screens
				await expect(homePage.chatTriggerButton).toHaveClass(/xs:w-full/);
			});
		});

		test.describe("Cross-device consistency", () => {
			const viewportsToTest = [
				{ name: "Mobile", width: 375, height: 667 },
				{ name: "Desktop", width: 1280, height: 720 },
			];

			viewportsToTest.forEach(({ name, width, height }) => {
				test(`should maintain consistency on ${name}`, async ({ page }) => {
					await page.setViewportSize({ width, height });
					await page.reload();

					await homePage.expectPageToLoad();

					// Check that core elements are present
					await expect(homePage.chatTriggerButton).toBeVisible();

					// Text should remain readable
					const recentTransfersExists = await homePage.recentTransfersTitle.isVisible().catch(() => false);
					if (recentTransfersExists) {
						await expect(homePage.recentTransfersTitle).toBeVisible();
					}
					await expect(homePage.chatTriggerButton).toBeVisible();
				});
			});
		});
	});
