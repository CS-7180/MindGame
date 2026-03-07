import { test, expect } from '@playwright/test';

test.describe('Post-Game Reflection', () => {
    test.describe.configure({ mode: 'serial' });

    test('athlete can log a pre-game, then see a post-game prompt and fulfill it', async ({ page }) => {
        // Log in
        await page.goto('/login');
        await page.fill('input[type="email"]', 'athlete@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("Sign in")');
        await page.waitForURL('**/home');

        // Note: For a pure E2E test, we'd either intercept the DB to inject a pending log,
        // or actually go through the pre-game logging routine flow to spawn a real today-log.
        // Doing the latter is most robust:

        // 1. Go to pre-game log (US-05)
        const preGameCard = page.locator('text=Pre-Game Log');
        await expect(preGameCard).toBeVisible();
        await preGameCard.click();
        await page.waitForURL('**/log/pre*');

        // Fill out pre-game to ensure a log exists today
        // Use more specific locator for the "Yes" radio option
        await page.locator('label[for="rc-yes"]').click();

        // Ensure anxiety and confidence are set (defaults are 3, but let's be explicit)
        const anxietyButtons = page.locator('button:has-text("3")');
        if (await anxietyButtons.count() >= 2) {
            await anxietyButtons.nth(0).click();
            await anxietyButtons.nth(1).click();
        }

        const saveBtn = page.locator('button:has-text("Save Pre-Game Log")');
        await expect(saveBtn).toBeEnabled();
        await saveBtn.click();

        // Should redirect to home as per PRD FR-05.4
        // Increased timeout to handle potential DB/Network delay in dev server
        await page.waitForURL('**/home', { timeout: 15000 });

        // 3. Verify the pending post-game reflection prompt is there
        const completeNowBtn = page.locator('text=Complete Now');
        await expect(completeNowBtn).toBeVisible({ timeout: 10000 });

        // 4. Click complete now
        await completeNowBtn.click();

        // Should land on post-game reflection page
        await page.waitForURL('**/post-game/*');
        await expect(page.locator('h1:has-text("Post-Game Reflection")')).toBeVisible();

        // 5. Fill out post-game data
        const ratingButtons = page.locator('button:has-text("4")');
        await ratingButtons.nth(0).click(); // Performance 4
        await ratingButtons.nth(1).click(); // Mental state 4

        await page.fill('#descriptor', 'Exhilarating');
        await page.click('button:has-text("Save Reflection")');

        // 6. Should redirect to history detail and show completed
        await page.waitForURL('**/history/*');
        await expect(page.locator('text=Completed').last()).toBeVisible(); // Next to Post-Game Reflection header
        await expect(page.locator('text=Exhilarating')).toBeVisible();
    });
});
