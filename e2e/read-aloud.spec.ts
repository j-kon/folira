import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Folira Read Aloud Offline Flow', () => {
  test('should import PDF, open Read Aloud, play speech, and function when network is offline without network calls', async ({
    page,
    context,
  }) => {
    // Navigate to app
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('header input[type="file"]', { state: 'attached' });

    // Upload sample PDF
    const pdfPath = path.resolve('./e2e/fixtures/sample.pdf');
    await page.setInputFiles('header input[type="file"]', pdfPath);

    // Verify document appears
    await expect(page.locator('h3', { hasText: 'sample' })).toBeVisible();

    // Open Reader
    await page.locator('h3', { hasText: 'sample' }).click();
    await expect(page.locator('canvas')).toBeVisible();

    // Disconnect network to verify 100% offline speech
    await context.setOffline(true);

    // Open Read Aloud Listen panel
    await page.locator('button[aria-label="Read Aloud Listen Panel"]').first().click();

    // Verify Read Aloud Modal opens
    await expect(page.locator('h3', { hasText: 'Folira Read Aloud' })).toBeVisible();

    // Click Play / Pause Narration button inside modal
    const playPauseBtn = page.locator('button[aria-label*="Narration"]').first();
    await expect(playPauseBtn).toBeVisible();
    await playPauseBtn.click();

    // Verify page indicator inside player modal
    await expect(page.locator('text=Page 1 of')).toBeVisible();

    // Reconnect network
    await context.setOffline(false);
  });
});
