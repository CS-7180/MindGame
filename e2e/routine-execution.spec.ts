import { test, expect } from '@playwright/test';

test.describe('Guided Routine Execution Flow', () => {
    test('should guide the athlete through the routine step-by-step', async ({ page }) => {
        // 0. Sign up a new athlete
        await page.goto('/signup');
        const uniqueEmail = `athlete_exec_${Date.now()}@example.com`;
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', 'password123');
        await page.click('text="Athlete"');
        await page.click('button:has-text("Create Account")');

        // Wait for redirect and ensure we are logged in
        await page.waitForURL('**/onboarding**');

        // Step 1: Sport
        await page.click('[data-testid="sport-basketball"]');
        await page.click('[data-testid="onboarding-next"]');

        // Step 2: Level
        await page.click('[data-testid="level-college"]');
        await page.click('[data-testid="onboarding-next"]');

        // Step 3: Symptoms
        await page.click('[data-testid="symptom-overthinking"]');
        await page.click('[data-testid="onboarding-next"]');

        // Step 4: Time
        await page.click('[data-testid="time-5min"]');
        await page.click('[data-testid="onboarding-complete"]');

        // Wait for redirect to result, then save recommended routine
        await page.waitForURL('**/onboarding/result');
        const saveRecommendedBtn = page.getByTestId('save-routine');
        await expect(saveRecommendedBtn).toBeVisible();
        await saveRecommendedBtn.click();

        // Wait for automatic redirect to home
        await page.waitForURL('**/home', { timeout: 10000 });

        // 0.5. Schedule a game for today by navigating directly to /games/new
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        await page.goto(`/games/new?sport=Basketball`);
        await page.waitForLoadState('networkidle');

        // Fill game scheduler form
        await page.locator('input[name="game_name"]').fill('E2E Test Game');
        await page.locator('input[name="game_date"]').fill(`${year}-${month}-${day}`);
        await page.locator('input[name="game_time"]').fill('23:59');

        // Submit the form - the submit button says "Schedule Game"
        await page.getByRole('button', { name: 'Schedule Game' }).click();

        // Wait for redirect back to home
        await page.waitForURL(/\/home.*/, { timeout: 15000 });

        // 0.7. Ensure a routine is active
        // After onboarding + saving a recommended routine, it should already be active.
        // But if not, activate it via the "My Routines" dialog.
        let routineButton = page.getByRole('button', { name: /Routine/i }).first();
        try {
            await expect(routineButton).toBeVisible({ timeout: 5000 });
        } catch {
            // Routine button not visible - need to activate a routine
            console.log("No Routine button found, attempting to activate a routine...");
            const myRoutinesBtn = page.getByRole('button', { name: 'My Routines' });
            await myRoutinesBtn.click();

            const activateBtn = page.getByRole('button', { name: /Set Active/i }).first();
            await expect(activateBtn).toBeVisible({ timeout: 5000 });
            await activateBtn.click();

            // Wait for success toast
            await page.waitForTimeout(1500);

            // Close dialog
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);

            // Refresh the page so the Routine button appears on the game card
            await page.reload();
            await page.waitForLoadState('networkidle');

            routineButton = page.getByRole('button', { name: /Routine/i }).first();
            await expect(routineButton).toBeVisible({ timeout: 10000 });
        }

        // 1. Click the Routine button on the game card → navigates to /routine/execute/[id]
        await routineButton.click();
        await page.waitForURL('**/routine/execute/*', { timeout: 10000 });

        // 2. The RoutineExecution component auto-starts (no "Start" button).
        //    Verify we see "Step 1 of N"
        await expect(page.locator('text=/Step 1 of/i')).toBeVisible({ timeout: 10000 });

        // 3. Complete all steps by clicking "Next Step" / "Continue" / "Complete Routine"
        let hasNext = true;
        while (hasNext) {
            const nextStepBtn = page.getByRole('button', { name: /Next Step/i }).first();
            const continueBtn = page.getByRole('button', { name: /Continue/i }).first();
            const completeBtn = page.getByRole('button', { name: /Complete Routine/i }).first();

            if (await completeBtn.isVisible()) {
                await completeBtn.click();
                hasNext = false;
            } else if (await nextStepBtn.isVisible()) {
                await nextStepBtn.click();
                // After clicking Next Step, a "Quick Insight" recommendation may appear
                // with a "Continue" button to advance to the next step
                await page.waitForTimeout(500);
            } else if (await continueBtn.isVisible()) {
                await continueBtn.click();
                await page.waitForTimeout(500);
            } else {
                // Safety exit to avoid infinite loop
                hasNext = false;
            }
        }

        // 4. Verify Completion Screen
        await expect(page.getByText('Routine Complete!')).toBeVisible({ timeout: 10000 });
        const logEntryBtn = page.getByRole('button', { name: /Log Pre-Game Entry/i });
        await expect(logEntryBtn).toBeVisible();

        // 5. Verify Navigation to Pre-Game Log
        await logEntryBtn.click();
        await page.waitForURL('**/log/pre*', { timeout: 10000 });
        await expect(page.locator('h1')).toContainText('Game Log');

        // Optional: Back to home check
        await page.goto('/home');
        await expect(page).toHaveURL(/\/home/);
    });
});
