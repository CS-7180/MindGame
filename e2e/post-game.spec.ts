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

        // 1. Ensure a game exists today by navigating directly to /games/new
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        await page.goto('/games/new');
        await page.waitForLoadState('networkidle');

        // Fill game scheduler form
        // The "sport" field may need to be filled if not locked
        const sportInput = page.locator('input[name="sport"]');
        if (await sportInput.isVisible()) {
            await sportInput.fill('Basketball');
        }
        await page.locator('input[name="game_name"]').fill('E2E Post-Game Test');
        await page.locator('input[name="game_date"]').fill(`${year}-${month}-${day}`);
        await page.locator('input[name="game_time"]').fill('23:59');

        // Submit game
        await page.getByRole('button', { name: 'Schedule Game' }).click();
        await page.waitForURL('**/home', { timeout: 15000 });

        // 2. Now click the "Pre-Game Log" button on the game card
        const preGameBtn = page.getByRole('button', { name: 'Pre-Game Log' }).first();
        await expect(preGameBtn).toBeVisible({ timeout: 10000 });
        await preGameBtn.click();
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
