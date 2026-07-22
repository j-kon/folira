import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Folira Offline Capability Flow', () => {
  test('should import PDF online and read document when network is disconnected', async ({ page, context }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type="file"]').first();
    const pdfPath = path.resolve('./e2e/fixtures/sample.pdf');
    await fileInput.setInputFiles(pdfPath);

    await expect(page.locator('h3', { hasText: 'sample' })).toBeVisible();

    // Disconnect network
    await context.setOffline(true);

    // Open reader while offline
    await page.locator('h3', { hasText: 'sample' }).click();

    // Confirm document opens and renders offline
    await expect(page.locator('h2', { hasText: 'sample' })).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
  });
});
