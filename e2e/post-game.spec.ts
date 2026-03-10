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

        // Detect which sport is active — the seeded athlete may have multiple sports
        // We'll use the first available sport for the game
        await page.waitForLoadState('networkidle');

        // 1. Schedule a game for today using the seeded athlete's first sport
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        // Get the currently active sport from the sidebar/header
        // The sport buttons are in the header — find the first one that's not "Add Sport"
        const sportButtons = page.locator('header button').filter({ hasNotText: /Add Sport|Settings|Log Out|MindGame/i });
        const firstSportBtn = sportButtons.first();
        const sportText = await firstSportBtn.innerText();
        // Extract sport name (remove emoji prefix like "⚽ " or "🏀 ")
        const activeSport = sportText.replace(/^[^\w]*/, '').trim();

        await page.goto(`/games/new?sport=${encodeURIComponent(activeSport)}`);
        await page.waitForLoadState('networkidle');

        // Fill game scheduler form — sport is auto-locked via ?sport=
        await page.locator('input[name="game_name"]').fill('E2E Post-Game Test');
        await page.locator('input[name="game_date"]').fill(`${year}-${month}-${day}`);
        await page.locator('input[name="game_time"]').fill('23:59');

        // Submit game
        await page.getByRole('button', { name: 'Schedule Game' }).click();
        await page.waitForURL(/\/home.*/, { timeout: 15000 });
        await page.waitForLoadState('networkidle');

        // 2. The Post-Game Log button appears when gamesToday is non-empty
        //    The dashboard should now show today's game in the Action Items section
        //    Make sure we're on the correct sport tab
        const currentSportTab = page.locator(`button:has-text("${activeSport}")`).first();
        if (await currentSportTab.isVisible()) {
            await currentSportTab.click();
            await page.waitForTimeout(1000);
        }

        // Look for "Pre-Game Log" button in Action Items (SportOverview)
        // OR "Fill Pre-Game Log" in GameDetail panel
        let preGameBtn = page.getByRole('button', { name: /Pre-Game Log/i }).first();

        if (!(await preGameBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
            // Try clicking the game in the sidebar
            const gameCard = page.locator('button:has-text("E2E Post-Game Test")').first();
            if (await gameCard.isVisible({ timeout: 3000 }).catch(() => false)) {
                await gameCard.click();
                await page.waitForTimeout(1000);
            }

            // Check for "Fill Pre-Game Log" in GameDetail
            const fillBtn = page.getByRole('button', { name: /Fill Pre-Game Log/i }).first();
            if (await fillBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                preGameBtn = fillBtn;
            }
        }

        await expect(preGameBtn).toBeVisible({ timeout: 10000 });
        await preGameBtn.click();
        await page.waitForURL('**/log/pre*');

        // Fill out pre-game to ensure a log exists today
        const rcYes = page.locator('label[for="rc-yes"]');
        if (await rcYes.isVisible({ timeout: 3000 }).catch(() => false)) {
            await rcYes.click();
        }

        // Ensure anxiety and confidence are set
        const anxietyButtons = page.locator('button:has-text("3")');
        if (await anxietyButtons.count() >= 2) {
            await anxietyButtons.nth(0).click();
            await anxietyButtons.nth(1).click();
        }

        const saveBtn = page.locator('button:has-text("Save Pre-Game Log")');
        await expect(saveBtn).toBeEnabled({ timeout: 5000 });
        await saveBtn.click();

        // Should redirect to home as per PRD FR-05.4
        await page.waitForURL(/\/home.*/, { timeout: 15000 });

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
        await expect(page.locator('text=Completed').last()).toBeVisible();
        await expect(page.locator('text=Exhilarating')).toBeVisible();
    });
});
