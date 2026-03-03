import { test, expect } from '@playwright/test';

test.describe('Guided Routine Execution Flow', () => {
    test('should guide the athlete through the routine step-by-step', async ({ page }) => {
        // 0. Log in first (Requires seeded DB user for local testing)
        await page.goto('/login');
        await page.fill('input[type="email"]', 'athlete@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("Sign in")');
        // Wait for redirect to home
        await page.waitForURL('**/home');

        // Note: For a robust E2E test, we would normally intercept the API 
        // to mock a routine, or ensure one is built prior to this test.
        // We assume the user has at least 1 routine created from US-02.

        // 1. Start the active routine from the home dashboard
        const startButton = page.getByTestId('start-routine');
        await expect(startButton).toBeVisible();
        await startButton.click();

        // 2. Verify Execution UI loads (AC-03.1, AC-03.3)
        await expect(page.locator('text=Step 1 of')).toBeVisible();
        await expect(page.locator('text=Total Time Left')).toBeVisible();

        // 3. Verify Technique Instructions (AC-03.2)
        // The instruction text should be visible (e.g., "Inhale for 4 counts...")
        const instructionText = page.locator('p.text-xl.sm\\:text-2xl');
        await expect(instructionText).toBeVisible();
        await expect(instructionText.innerText()).not.toBe('');

        // 4. Test Pause and Resume (AC-03.4)
        // Check if the timer is ticking (Play button isn't showing, meaning it's running)
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
        await expect(page).toHaveURL('**/home');
    });
});
