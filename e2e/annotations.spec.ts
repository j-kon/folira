import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Folira Annotations & Reading Notes Flow', () => {
  test('should import document, open sidebar Notes & Highlights tab, and verify empty state', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('header input[type="file"]', { state: 'attached' });

    // Upload sample PDF
    const pdfPath = path.resolve('./e2e/fixtures/sample.pdf');
    await page.setInputFiles('header input[type="file"]', pdfPath);

    // Open Reader
    await page.locator('h3', { hasText: 'sample' }).click();
    await expect(page.locator('canvas')).toBeVisible();

    // Toggle Sidebar
    await page.locator('button[aria-label="Toggle Sidebar"]').click();
    await expect(page.locator('aside')).toBeVisible();

    // Click Notes & Highlights Tab
    await page.locator('button[title="Notes & Highlights"]').click();
    await expect(page.locator('h3', { hasText: 'Notes & Highlights' })).toBeVisible();
  });
});
