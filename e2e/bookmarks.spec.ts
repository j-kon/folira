import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Folira Bookmark Flow', () => {
  test('should create, persist, and navigate using bookmarks', async ({ page }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type="file"]').first();
    const pdfPath = path.resolve('./e2e/fixtures/sample.pdf');
    await fileInput.setInputFiles(pdfPath);

    // Open Reader
    await page.locator('h3', { hasText: 'sample' }).click();

    // Click Bookmark button
    await page.locator('button[aria-label="Bookmark page"]').click();

    // Open Sidebar
    await page.locator('button[aria-label="Toggle Sidebar"]').click();

    // Click Bookmarks Tab
    await page.locator('button[title="Bookmarks"]').click();
    await expect(page.locator('text=Bookmarks (1)')).toBeVisible();

    // Reload page
    await page.reload();

    // Verify Reader reopens and bookmark persists
    await page.locator('button[aria-label="Toggle Sidebar"]').click();
    await page.locator('button[title="Bookmarks"]').click();
    await expect(page.locator('text=Bookmarks (1)')).toBeVisible();
  });
});
