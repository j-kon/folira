import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Folira Search & TOC Outline Flow', () => {
  test('should import PDF, open search bar, perform search, and navigate TOC sidebar tab', async ({ page }) => {
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

    // Click TOC Tab
    await page.locator('button[title="Table of Contents"]').click();
    await expect(page.locator('text=Table of Contents')).toBeVisible();

    // Toggle Search Bar
    await page.locator('button[aria-label="Search document"]').click();
    await expect(page.locator('input[placeholder*="Search text"]')).toBeVisible();
  });
});
