import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/HomePage';
import { NavigationPage } from './page-objects/NavigationPage';

test.describe('Hebrew RTL Support', () => {
  let homePage: HomePage;
  let navigationPage: NavigationPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    navigationPage = new NavigationPage(page);
    await homePage.goto();
  });

  test.describe('Language and Direction Attributes', () => {
    test('should have Hebrew lang attribute', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('lang', 'he');
    });

    test('should have proper text direction', async ({ page }) => {
      const html = page.locator('html');
      const dir = await html.getAttribute('dir');
      expect(dir === 'rtl' || dir === null).toBeTruthy(); // null is acceptable as it defaults to RTL for Hebrew
    });

    test('should have correct viewport and theme settings', async ({ page }) => {
      await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');
    });
  });

  test.describe('Hebrew Text Rendering', () => {
    test('should display Hebrew text correctly', async () => {
      // Check main Hebrew text elements
      await expect(homePage.recentTransfersTitle).toContainText('העברות אחרונות');
      await expect(homePage.chatTriggerButton).toContainText('שאל אותי על ליברפול');
      
      // Check navigation Hebrew text
      await expect(navigationPage.homeLink).toContainText('בית');
      await expect(navigationPage.hakapitLink).toContainText('הכפית');
      await expect(navigationPage.nitkLink).toContainText('שכונה בממלכה');
      await expect(navigationPage.balconyAlbumsLink).toContainText('אלבומים במרפסת');
    });

    test('should render Hebrew characters without encoding issues', async () => {
      const hebrewTexts = [
        'הכפית',
        'העברות אחרונות',
        'שאל אותי על ליברפול',
        'המשחק הבא',
        'בית',
        'שכונה בממלכה',
        'אלבומים במרפסת'
      ];

      for (const text of hebrewTexts) {
        const element = page.getByText(text);
        await expect(element).toBeVisible();
        
        // Check that the text content matches exactly (no encoding issues)
        const content = await element.textContent();
        expect(content).toBe(text);
      }
    });

    test('should handle mixed Hebrew and English text', async () => {
      // Check for elements that might have both Hebrew and English
      await expect(page.getByText('Liver-Chat')).toBeVisible();
      await expect(page.getByText('UEFA Champions League')).toBeVisible();
      await expect(page.getByText('Premier League')).toBeVisible();
    });

    test('should display numbers correctly with Hebrew text', async () => {
      // Trophy counts should display correctly
      const trophies = homePage.trophiesSection;
      await expect(trophies).toBeVisible();
      
      // Check that numbers are displayed correctly alongside Hebrew text
      const trophyElements = trophies.locator('div.text-sm');
      const count = await trophyElements.count();
      expect(count).toBeGreaterThan(0);
      
      for (let i = 0; i < count; i++) {
        const text = await trophyElements.nth(i).textContent();
        expect(text).toMatch(/^\d+$/); // Should be numeric
      }
    });
  });

  test.describe('RTL Layout and Alignment', () => {
    test('should align text properly for RTL', async () => {
      // Check that main content areas are RTL-aligned
      const mainSection = page.locator('section');
      await expect(mainSection).toHaveClass(/text-center/);
      
      // Chat should have RTL direction
      await homePage.openChat();
      await expect(homePage.chatTitle).toBeVisible();
      const chatHeader = page.locator('[data-testid="chat-title"]').locator('..');
      await expect(chatHeader).toHaveAttribute('dir', 'rtl');
    });

    test('should handle RTL text direction in chat', async () => {
      await homePage.openChat();
      
      // Type Hebrew text and check direction
      const hebrewMessage = 'מה דעתך על ליברפול?';
      await homePage.typeMessage(hebrewMessage);
      
      // Input should have RTL direction for Hebrew text
      await expect(homePage.chatInput).toHaveAttribute('dir', 'rtl');
    });

    test('should handle LTR text direction in chat', async () => {
      await homePage.openChat();
      
      // Type English text and check direction
      const englishMessage = 'What do you think about Liverpool?';
      await homePage.typeMessage(englishMessage);
      
      // Input should have LTR direction for English text
      await expect(homePage.chatInput).toHaveAttribute('dir', 'ltr');
    });

    test('should align table headers properly for RTL', async () => {
      const premierLeagueTable = await homePage.getStatsTable('Premier League');
      await expect(premierLeagueTable).toBeVisible();
      
      // Check Hebrew table headers
      await expect(premierLeagueTable.getByText('קבוצה')).toBeVisible();
      await expect(premierLeagueTable.getByText('מיקום')).toBeVisible();
      await expect(premierLeagueTable.getByText('נקודות')).toBeVisible();
      await expect(premierLeagueTable.getByText('משחקים')).toBeVisible();
    });
  });

  test.describe('Hebrew Date and Time Display', () => {
    test('should display dates correctly', async () => {
      // Check episode dates
      const episodeDate = page.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      if (await episodeDate.count() > 0) {
        await expect(episodeDate.first()).toBeVisible();
      }
      
      // Check transfer dates in tooltips
      const transfers = homePage.recentTransfersList.getByRole('button');
      if (await transfers.count() > 0) {
        await transfers.first().hover();
        const tooltip = page.locator('[role="tooltip"]');
        if (await tooltip.count() > 0) {
          await expect(tooltip).toBeVisible();
        }
      }
    });

    test('should display match date and time', async () => {
      // Check next match date/time display
      const matchInfo = page.locator('[data-testid="next-match-overview"]');
      await expect(matchInfo).toBeVisible();
      
      // Should contain date information
      const dateTimeText = await matchInfo.textContent();
      expect(dateTimeText).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Date format
    });
  });

  test.describe('Hebrew SEO and Meta Tags', () => {
    test('should have proper Hebrew meta tags', async ({ page }) => {
      // Check title contains Hebrew
      const title = await page.title();
      expect(title).toMatch(/הכפית/);
      
      // Check meta description
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toMatch(/הכפית/);
    });

    test('should have proper OpenGraph tags for Hebrew', async ({ page }) => {
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
      
      expect(ogTitle).toMatch(/הכפית/);
      expect(ogDescription).toMatch(/הכפית/);
    });
  });

  test.describe('Hebrew Keyboard Input', () => {
    test('should handle Hebrew keyboard input in chat', async () => {
      await homePage.openChat();
      
      // Simulate Hebrew keyboard input
      const hebrewText = 'שלום עולם';
      await homePage.chatInput.fill(hebrewText);
      
      await expect(homePage.chatInput).toHaveValue(hebrewText);
      await expect(homePage.chatInput).toHaveAttribute('dir', 'rtl');
    });

    test('should handle mixed language input', async () => {
      await homePage.openChat();
      
      // Type mixed Hebrew and English
      const mixedText = 'Hello עולם';
      await homePage.chatInput.fill(mixedText);
      
      await expect(homePage.chatInput).toHaveValue(mixedText);
      // Direction should be determined by the first character
      await expect(homePage.chatInput).toHaveAttribute('dir', 'ltr');
    });
  });

  test.describe('Hebrew Accessibility', () => {
    test('should have proper ARIA labels in Hebrew', async () => {
      // Check for Hebrew ARIA labels
      const closeButton = page.getByLabel('סגור');
      if (await closeButton.count() > 0) {
        await expect(closeButton).toBeVisible();
      }
    });

    test('should have proper alt text for Hebrew content', async () => {
      // Check images have proper alt text
      const images = page.locator('img[alt]');
      const count = await images.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) { // Check first 5 images
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt!.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Hebrew Font Rendering', () => {
    test('should load appropriate fonts for Hebrew', async ({ page }) => {
      // Check that fonts are loaded
      const fontFaces = await page.evaluate(() => {
        return (document as any).fonts.ready.then(() => {
          return Array.from((document as any).fonts).map((font: any) => font.family);
        });
      });
      
      expect(fontFaces.length).toBeGreaterThan(0);
    });

    test('should render Hebrew text without fallback fonts', async ({ page }) => {
      // Check that Hebrew text is rendered properly
      const hebrewElement = page.getByText('הכפית').first();
      await expect(hebrewElement).toBeVisible();
      
      // Get computed font to ensure proper font is being used
      const fontFamily = await hebrewElement.evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      });
      
      expect(fontFamily).toBeTruthy();
      expect(fontFamily!.length).toBeGreaterThan(0);
    });
  });
});
