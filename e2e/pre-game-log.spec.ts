import { test, expect } from '@playwright/test';

test.describe('US-05: Pre-Game Entry Log Flow', () => {
    test('athlete can complete their routine and log pre-game state', async ({ page }) => {
        // Generate a unique email for the remote DB
        const uniqueEmail = `test-athlete-${Date.now()}@example.com`;
        const testPassword = 'password123!';

        // 1. Sign up to the application
        await page.goto('/signup');
        await page.fill('input[id="displayName"]', 'Test Athlete');
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', testPassword);
        await page.click('button:has-text("Create Account")');

        // Wait for redirect to onboarding (assumes no email confirmation required for dev)
        await page.waitForURL('**/onboarding*');

        // 2. Complete bare minimum onboarding
        // Step 1: Sport Selection
        const sportSelect = page.locator('button[role="combobox"]').first();
        await sportSelect.click();
        await page.locator('div[role="option"]').first().click(); // Pick first sport
        await page.getByRole('button', { name: /Next Step/i }).click();

        // Step 2: Anxiety & Confidence
        await page.getByRole('button', { name: /Next Step/i }).click(); // Skip default sliders

        // Step 3: Current Routine
        await page.getByRole('button', { name: /Complete Profile/i }).click();

        // Wait for redirect to home
        await page.waitForURL('**/home');

        // 3. We skip testing the full routine execution flow and go directly to completion screen
        // In a real flow, they'd finish execution and end up here
        await page.goto('/routine/complete?routineName=Game%20Day%20Focus');
        await page.waitForLoadState('networkidle');

        // 4. Click "Log Pre-Game Entry" to ensure routing works
        const logEntryBtn = page.getByRole('button', { name: /Log Pre-Game Entry/i });
        await expect(logEntryBtn).toBeVisible();
        await logEntryBtn.click();

        // 5. Verify we arrived at the Pre-Game Log page
        await page.waitForURL('**/log/pre');
        await expect(page.getByText('Pre-Game Log')).toBeVisible();

        // 6. Fill out the Pre-Game Log Form
        await expect(page.getByText('Did you complete your pre-game routine?')).toBeVisible();

        // Click "Partially completed" to test interaction
        await page.locator('text=Partially completed').click();

        // Interact with the sliders
        // Let's set Anxiety to 4
        const anxietySlider = page.locator('div[role="slider"]').first();
        await anxietySlider.focus();
        await page.keyboard.press('ArrowRight');

        // Let's set Confidence to 2
        const confidenceSlider = page.locator('div[role="slider"]').nth(1);
        await confidenceSlider.focus();
        await page.keyboard.press('ArrowLeft');

        // Fill in notes
        const notesTextbox = page.getByPlaceholder('How is your body feeling right now? Any specific worries?');
        await notesTextbox.fill('Leg feels a bit tight, but ready to go.');

        // 7. Submit the form
        const submitBtn = page.getByRole('button', { name: /Save Game Log/i });
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();

        // 8. Verify we are redirected back to the Home Dashboard
        await page.waitForURL('**/home');

        // Should be on dashboard
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
});
