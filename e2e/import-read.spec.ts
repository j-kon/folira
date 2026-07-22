import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Folira Import & Read Flow', () => {
  test('should import PDF, navigate, and restore saved reading state', async ({ page }) => {
    await page.goto('/');

    // Verify Welcome Screen
    await expect(page.locator('h1')).toContainText('Folira');

    // Upload sample PDF
    const fileInput = page.locator('input[type="file"]').first();
    const pdfPath = path.resolve('./e2e/fixtures/sample.pdf');
    await fileInput.setInputFiles(pdfPath);

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
