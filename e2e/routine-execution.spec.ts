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
        
        // 0.6. Ensure a routine is active
        // If no routine is active, try to activate the first one found
        const activeRoutineCard = page.getByTestId('active-routine');
        const isAlreadyActive = await activeRoutineCard.isVisible();
        
        if (!isAlreadyActive) {
            console.log("No active routine found, attempting to activate...");
            const activateBtn = page.getByRole('button', { name: /Activate/i }).first();
            try {
                await expect(activateBtn).toBeVisible({ timeout: 5000 });
            } catch {
                console.log("Activate button not found, reloading page...");
                await page.reload();
                await expect(activateBtn).toBeVisible({ timeout: 10000 });
            }
            await activateBtn.click();
            await expect(activeRoutineCard).toBeVisible({ timeout: 10000 });
        }

        // 1. Start the active routine from the home dashboard
        const startButton = page.getByTestId('start-routine');
        await expect(startButton).toBeVisible();
        await startButton.click();

        // 2. Verify Execution UI loads (AC-03.1, AC-03.3)
        await expect(page.getByTestId('step-display')).toBeVisible();
        
        // 3. Complete all steps (AC-03.4)
        // We know the recommended routine has multiple steps
        let nextBtn = page.getByRole('button', { name: /Next Step/i });
        while (await nextBtn.isVisible()) {
            await nextBtn.click();
            await page.waitForTimeout(500); // Small delay for animation
        }

        // 6. Complete the routine (AC-03.5)
        const completeBtn = page.getByRole('button', { name: /Complete Routine/i });
        await expect(completeBtn).toBeVisible();
        await completeBtn.click();

        // 7. Verify Completion Confirmation Screen
        await expect(page.getByText('Routine Complete!')).toBeVisible();
        const logEntryBtn = page.getByRole('button', { name: /Log Pre-Game Entry/i });
        await expect(logEntryBtn).toBeVisible();

        // 8. Verify Navigation to Pre-Game Log (AC-03.5)
        await logEntryBtn.click();
        await page.waitForURL('**/log/pre');
        await expect(page.getByRole('heading', { name: /Game Log/i })).toBeVisible();

        // Optional: Back to home check
        await page.goto('/home');
        await expect(page).toHaveURL(/\/home/);
    });
});
