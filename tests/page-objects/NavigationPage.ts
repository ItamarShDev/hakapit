import { expect, type Page } from "@playwright/test";

export class NavigationPage {
	constructor(private page: Page) {}

	// Navigation elements
	get homeLink() {
		return this.page.getByRole("link", { name: "בית" }).first();
	}

	get hakapitLink() {
		return this.page.getByRole("link", { name: "הכפית" }).nth(1);
	}

	get nitkLink() {
		return this.page.getByRole("link", { name: "שכונה בממלכה" }).first();
	}

	get balconyAlbumsLink() {
		return this.page.getByRole("link", { name: "אלבומים במרפסת" }).first();
	}

	get logoLink() {
		return this.page.getByRole("link", { name: "הכפית" }).first().locator("..");
	}

	// Navigation actions
	async navigateToHome() {
		await this.homeLink.click();
	}

	async navigateToHakapit() {
		await this.hakapitLink.click();
	}

	async navigateToNitk() {
		await this.nitkLink.click();
	}

	async navigateToBalconyAlbums() {
		await this.balconyAlbumsLink.click();
	}

	async clickLogo() {
		await this.logoLink.click();
	}

	// Navigation expectations
	async expectNavigationToBeVisible() {
		await expect(this.homeLink).toBeVisible();
		await expect(this.hakapitLink).toBeVisible();
		await expect(this.nitkLink).toBeVisible();
		await expect(this.balconyAlbumsLink).toBeVisible();
	}

	async expectActiveLink(linkName: string) {
		const link = this.page.getByRole("link", { name: linkName });
		await expect(link).toHaveClass(/active/);
	}

	async expectUrlToContain(path: string) {
		await expect(this.page).toHaveURL(new RegExp(path));
	}

	async expectPageTitle(title: string) {
		await expect(this.page).toHaveTitle(new RegExp(title));
	}

	// Responsive navigation
	async isMobileView() {
		const width = this.page.viewportSize()?.width || 0;
		return width < 768;
	}

	async expectMobileNavigation() {
		if (await this.isMobileView()) {
			// Mobile navigation might have different layout
			const navigation = this.page.locator("nav");
			await expect(navigation).toBeVisible();
		}
	}

	async expectDesktopNavigation() {
		if (!(await this.isMobileView())) {
			// Desktop navigation should be horizontal
			const navigation = this.page.locator("nav");
			await expect(navigation).toBeVisible();
		}
	}

	// Footer links
	get twitterLink() {
		return this.page.getByRole("link", { name: "Twitter" });
	}

	get threadsLink() {
		return this.page.getByRole("link", { name: "Threads" });
	}

	get facebookLink() {
		return this.page.getByRole("link", { name: "Facebook" });
	}

	get instagramLink() {
		return this.page.getByRole("link", { name: "Instagram" });
	}

	get podlinkLink() {
		return this.page.getByRole("link", { name: "Pod.link" });
	}

	async expectFooterLinksToBeVisible() {
		await expect(this.twitterLink).toBeVisible();
		await expect(this.threadsLink).toBeVisible();
		await expect(this.facebookLink).toBeVisible();
		await expect(this.instagramLink).toBeVisible();
		await expect(this.podlinkLink).toBeVisible();
	}

	async clickTwitterLink() {
		await this.twitterLink.click();
	}

	async clickThreadsLink() {
		await this.threadsLink.click();
	}

	async clickFacebookLink() {
		await this.facebookLink.click();
	}

	async clickInstagramLink() {
		await this.instagramLink.click();
	}

	async clickPodlinkLink() {
		await this.podlinkLink.click();
	}

	// Helper methods
	async waitForPageLoad() {
		await this.page.waitForLoadState("networkidle");
	}

	async waitForNavigation() {
		await this.page.waitForLoadState("domcontentloaded");
	}
}
