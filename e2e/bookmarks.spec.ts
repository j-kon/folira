import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Folira Bookmark Flow', () => {
  test('should create, persist, and navigate using bookmarks', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[type="file"]', { state: 'attached' });

    const pdfPath = path.resolve('./e2e/fixtures/sample.pdf');
    await page.setInputFiles('input[type="file"]', pdfPath);

    // Open Reader
    await page.locator('h3', { hasText: 'sample' }).click();

    // Click Bookmark button (first one in desktop/mobile toolbar)
    await page.locator('button[aria-label="Bookmark page"]').first().click();

    // Open Sidebar (first one in desktop/mobile toolbar)
    await page.locator('button[aria-label="Toggle Sidebar"]').first().click();

    // Click Bookmarks Tab
    await page.locator('button[title="Bookmarks"]').click();
    await expect(page.locator('text=Bookmarks (1)')).toBeVisible();

    // Reload page
    await page.reload();

    // Verify Reader reopens and bookmark persists
    await page.locator('button[aria-label="Toggle Sidebar"]').first().click();
    await page.locator('button[title="Bookmarks"]').click();
    await expect(page.locator('text=Bookmarks (1)')).toBeVisible();
  });
});
