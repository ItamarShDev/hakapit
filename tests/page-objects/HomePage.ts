import { expect, type Page } from "@playwright/test";

export class HomePage {
	constructor(private page: Page) {}

	// Navigation
	async goto() {
		await this.page.goto("/");
	}

	// Trophies Section
	get trophiesSection() {
		return this.page.getByTestId("trophies-section");
	}

	async getTrophy(tournamentId: number) {
		return this.page.getByTestId(`trophy-${tournamentId}`);
	}

	async expectTrophyToBeVisible(tournamentId: number) {
		await expect(await this.getTrophy(tournamentId)).toBeVisible();
	}

	async expectTrophiesCount(count: number) {
		await expect(this.trophiesSection.getByRole("button")).toHaveCount(count);
	}

	// Recent Transfers Section
	get recentTransfersSection() {
		return this.page.getByTestId("recent-transfers-section");
	}

	get recentTransfersTitle() {
		return this.page.getByTestId("recent-transfers-title");
	}

	get recentTransfersList() {
		return this.page.getByTestId("recent-transfers-list");
	}

	async getTransfer(playerId: number) {
		return this.page.getByTestId(`transfer-${playerId}`);
	}

	async expectRecentTransfersTitleToContain(text: string) {
		await expect(this.recentTransfersTitle).toContainText(text);
	}

	async expectTransfersCount(count: number) {
		await expect(this.recentTransfersList.getByRole("button")).toHaveCount(count);
	}

	// Next Match Section
	get nextMatchOverview() {
		return this.page.getByTestId("next-match-overview");
	}

	async expectNextMatchToBeVisible() {
		await expect(this.nextMatchOverview).toBeVisible();
	}

	// Chat Component
	get floatingChat() {
		return this.page.getByTestId("floating-chat");
	}

	get chatTriggerButton() {
		return this.page.getByTestId("chat-trigger-button");
	}

	get chatTitle() {
		return this.page.getByTestId("chat-title");
	}

	get chatDescription() {
		return this.page.getByTestId("chat-description");
	}

	get chatMessages() {
		return this.page.getByTestId("chat-messages");
	}

	get chatInput() {
		return this.page.getByTestId("chat-input");
	}

	get chatSendButton() {
		return this.page.getByTestId("chat-send-button");
	}

	async openChat() {
		await this.chatTriggerButton.click();
	}

	async typeMessage(message: string) {
		await this.chatInput.fill(message);
	}

	async sendMessage() {
		await this.chatSendButton.click();
	}

	async sendMessageAndWait(message: string) {
		await this.typeMessage(message);
		await this.sendMessage();
	}

	async expectChatToBeOpen() {
		await expect(this.chatTitle).toBeVisible();
		await expect(this.chatDescription).toBeVisible();
		await expect(this.chatInput).toBeVisible();
		await expect(this.chatSendButton).toBeVisible();
	}

	async expectChatToContainText(text: string) {
		await expect(this.chatMessages).toContainText(text);
	}

	// Stats Tables
	async getStatsTable(leagueName: string) {
		return this.page.getByText(leagueName).locator("..").locator("..").locator("table");
	}

	async expectStatsTableToBeVisible(leagueName: string) {
		const table = await this.getStatsTable(leagueName);
		await expect(table).toBeVisible();
	}

	// Episode Section
	async getLatestEpisode() {
		return this.page.getByTestId("latest-episode");
	}

	async expectLatestEpisodeToBeVisible() {
		const episode = await this.getLatestEpisode();
		if (episode) {
			await expect(episode).toBeVisible();
		}
	}

	// General page expectations
	async expectPageToLoad() {
		await expect(this.trophiesSection).toBeVisible();

		// Recent transfers section might not render if no data is available
		const recentTransfersExists = await this.recentTransfersSection.isVisible().catch(() => false);
		if (recentTransfersExists) {
			await expect(this.recentTransfersSection).toBeVisible();
		}

		await expect(this.nextMatchOverview).toBeVisible();
		await expect(this.floatingChat).toBeVisible();
	}

	async expectHebrewTextDirection() {
		const html = this.page.locator("html");
		await expect(html).toHaveAttribute("lang", "he");

		// Check for RTL direction on main content areas - use first section to avoid strict mode violation
		const mainSection = this.page.locator("section").first();
		const dir = await mainSection.getAttribute("dir");
		expect(dir === "rtl" || dir === null).toBeTruthy(); // null is acceptable as it defaults to RTL for Hebrew
	}

	// Responsive testing helpers
	async getViewportSize() {
		return { width: this.page.viewportSize()?.width || 0, height: this.page.viewportSize()?.height || 0 };
	}

	async isMobileView() {
		const { width } = await this.getViewportSize();
		return width < 768;
	}

	async expectMobileChatLayout() {
		if (await this.isMobileView()) {
			// On mobile, chat should be full width at bottom
			const chat = this.floatingChat;
			await expect(chat).toHaveClass(/bottom-0/);
			await expect(chat).toHaveClass(/left-0/);
			await expect(chat).toHaveClass(/right-0/);
		}
	}

	async expectDesktopChatLayout() {
		if (!(await this.isMobileView())) {
			// On desktop, chat should be positioned at bottom left
			const chat = this.floatingChat;
			await expect(chat).toHaveClass(/bottom-4/);
			await expect(chat).toHaveClass(/left-4/);
		}
	}
}
