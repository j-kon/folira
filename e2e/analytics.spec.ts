import { test, expect } from '@playwright/test';

test.describe('Folira Reading Analytics & Goals Flow', () => {
  test('should navigate to /analytics and display metric cards and reading goals', async ({ page }) => {
    await page.goto('/analytics', { waitUntil: 'domcontentloaded' });

    // Verify Title & Header
    await expect(page.locator('h1', { hasText: 'Reading Analytics & Goals' })).toBeVisible();

    // Verify Metric Cards
    await expect(page.locator('text=Total Time Read')).toBeVisible();
    await expect(page.locator('text=Daily Streak')).toBeVisible();

    // Open Edit Goals Modal
    await page.locator('button', { hasText: 'Edit Goals' }).click();
    await expect(page.locator('h3', { hasText: 'Update Reading Goals' })).toBeVisible();

    // Close Modal
    await page.locator('button', { hasText: 'Cancel' }).click();
    await expect(page.locator('h3', { hasText: 'Update Reading Goals' })).not.toBeVisible();
  });
});
