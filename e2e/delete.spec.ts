import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Folira Delete Document Flow', () => {
  test('should import and delete document with confirmation modal', async ({ page }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type="file"]').first();
    const pdfPath = path.resolve('./e2e/fixtures/sample.pdf');
    await fileInput.setInputFiles(pdfPath);

    await expect(page.locator('h3', { hasText: 'sample' })).toBeVisible();

    // Open options menu
    await page.locator('button[aria-label*="Options menu"]').click();

    // Click Remove from library
    await page.locator('button', { hasText: 'Remove from library' }).click();

    // Confirm deletion modal
    await expect(page.locator('h4', { hasText: 'Remove Document?' })).toBeVisible();
    await page.locator('button', { hasText: 'Remove Document' }).click();

    // Verify Welcome screen returns
    await expect(page.locator('h1', { hasText: 'Folira' })).toBeVisible();
  });
});
