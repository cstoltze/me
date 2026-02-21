import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {
    test('should send a message and receive a response', async ({ page }) => {
        await page.goto('/');

        const textarea = page.getByPlaceholder('Ask me anything...');
        await textarea.fill('Who is Coleman?');
        await page.keyboard.press('Enter');

        // Wait for the message to appear in the list
        await expect(page.locator('.prose')).toContainText('Coleman');
    });

    test('should work with suggested questions', async ({ page }) => {
        await page.goto('/');

        // Find a suggested question button and click it
        const questionButton = page.locator('button:has-text("?")').first();
        const questionText = await questionButton.innerText();
        await questionButton.click();

        // Verify the question appears in the chat
        await expect(page.locator('.prose')).toContainText(questionText);
    });
});
