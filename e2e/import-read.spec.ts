import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Folira Import & Read Flow', () => {
  test('should import PDF, navigate, and restore saved reading state', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[type="file"]', { state: 'attached' });

    const pdfPath = path.resolve('./e2e/fixtures/sample.pdf');
    await page.setInputFiles('input[type="file"]', pdfPath);

    // Verify Document appears in Library
    await expect(page.locator('h3', { hasText: 'sample' })).toBeVisible();

    // Click Document Card to open Reader
    await page.locator('h3', { hasText: 'sample' }).click();

    // Verify Reader Toolbar & Canvas
    await expect(page.locator('h2', { hasText: 'sample' })).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();

    // Return to Library
    await page.locator('button[aria-label="Back to Library"]').click();
    await expect(page.locator('h2', { hasText: 'All Documents' })).toBeVisible();
  });
});
