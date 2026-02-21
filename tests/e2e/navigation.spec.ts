import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test('should navigate to the resume page', async ({ page }) => {
        await page.goto('/');
        await page.click('text=Resume');
        await expect(page).toHaveURL(/\/resume/);
        await expect(page.locator('h1')).toContainText('Coleman Stoltze');
    });

    test('should navigate back to home from resume', async ({ page }) => {
        await page.goto('/resume');
        await page.click('text=Chat');
        await expect(page).toHaveURL(/\//);
    });
});
