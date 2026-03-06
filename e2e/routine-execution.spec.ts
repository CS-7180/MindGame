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

        // Wait for redirect to result, then go to home
        await page.waitForURL('**/onboarding/result');
        await page.goto('/home');

        // 0.5. Create a routine first so we have one to execute
        await page.goto('/routine/builder');
        await page.locator('[data-testid^="technique-item-"]').first().click();
        const nameInput = page.getByPlaceholder(/Give your routine a name/i);
        await nameInput.fill('Execution Test Routine', { force: true });
        await expect(nameInput).toHaveValue('Execution Test Routine');
        const saveBtn = page.getByRole('button', { name: /save routine/i });
        await expect(saveBtn).toBeEnabled();
        await saveBtn.scrollIntoViewIfNeeded();
        await saveBtn.click();
        await page.goto('/home');

        // 1. Start the active routine from the home dashboard
        const startButton = page.getByTestId('start-routine');
        await expect(startButton).toBeVisible();
        await startButton.click();

        // 2. Verify Execution UI loads (AC-03.1, AC-03.3)
        await expect(page.locator('text=Step 1 of')).toBeVisible();
        await expect(page.locator('text=Total Time Left')).toBeVisible();

        // 3. Verify Technique Instructions (AC-03.2)
        const instructionText = page.locator('p.text-xl.sm\\:text-2xl');
        await expect(instructionText).toBeVisible();
        await expect(instructionText.innerText()).not.toBe('');

        // 4. Test Pause and Resume (AC-03.4)
        const pauseResumeBtn = page.locator('button:has(.lucide-pause), button:has(.lucide-play)');
        await pauseResumeBtn.click(); // Pause it

        // Reload the page to simulate leaving and returning
        await page.reload();

        // It should still be on Step 1, but in a paused state (Play icon visible)
        await expect(page.locator('text=Step 1 of')).toBeVisible();
        await expect(page.locator('svg.lucide-play')).toBeVisible();

        // Resume it
        await page.locator('button:has(.lucide-play)').click();

        // 5. Advance through steps
        const nextStepBtn = page.getByRole('button', { name: /Next Step|Complete Routine/i });
        while (await nextStepBtn.innerText() !== 'Complete Routine') {
            await nextStepBtn.click();
        }

        // 6. Complete the routine (AC-03.5)
        await nextStepBtn.click(); // Click 'Complete Routine'

        // 7. Verify Completion Confirmation Screen
        await expect(page.getByText('Routine Complete!')).toBeVisible();
        const logEntryBtn = page.getByRole('button', { name: /Log Pre-Game Entry/i });
        await expect(logEntryBtn).toBeVisible();

        // Click to return to home (or proceed to log)
        await page.getByRole('button', { name: /Back to Home/i }).click();
        await expect(page).toHaveURL(/\/home/);
    });
});
