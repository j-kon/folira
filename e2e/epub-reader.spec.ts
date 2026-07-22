import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Folira EPUB Ebook Reader Flow', () => {
  test('should import PDF/EPUB, display document in library, and open reader', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('header input[type="file"]', { state: 'attached' });

    // Upload sample PDF
    const pdfPath = path.resolve('./e2e/fixtures/sample.pdf');
    await page.setInputFiles('header input[type="file"]', pdfPath);

    // Verify document appears in library
    await expect(page.locator('h3', { hasText: 'sample' })).toBeVisible();

    // Open Reader
    await page.locator('h3', { hasText: 'sample' }).click();
    await expect(page.locator('canvas')).toBeVisible();
  });
});
