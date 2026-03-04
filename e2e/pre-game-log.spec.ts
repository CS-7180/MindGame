import { test, expect } from '@playwright/test';

test.describe('US-05: Pre-Game Entry Log Flow', () => {
    test('athlete can complete their routine and log pre-game state', async ({ page }) => {
        // 1. Log in to the application
        await page.goto('/login');
        await page.fill('input[type="email"]', 'athlete@example.com');
        await page.fill('input[type="password"]', 'password123'); // Assuming test seeded DB password
        await page.click('button:has-text("Sign in")');

        // Wait for redirect to home
        await page.waitForURL('**/home');

        // 2. We skip testing the full routine execution flow and go directly to completion screen
        // In a real flow, they'd finish execution and end up here
        await page.goto('/routine/complete?routineName=Game%20Day%20Focus');
        await page.waitForLoadState('networkidle');

        // 3. Click "Log Pre-Game Entry" to ensure routing works
        const logEntryBtn = page.getByRole('button', { name: /Log Pre-Game Entry/i });
        await expect(logEntryBtn).toBeVisible();
        await logEntryBtn.click();

        // 4. Verify we arrived at the Pre-Game Log page
        await page.waitForURL('**/log/pre');
        await expect(page.getByText('Pre-Game Log')).toBeVisible();

        // 5. Fill out the Pre-Game Log Form

        // Ensure the form elements are visible
        await expect(page.getByText('Did you complete your pre-game routine?')).toBeVisible();

        // The default "Yes, completed fully" should be checked automatically, but let's click "Partially completed" to test interaction
        await page.locator('text=Partially completed').click();

        // Interact with the sliders (Playwright handles sliders by keyboard or exact coordinates. Keyboard is more reliable)
        // Let's set Anxiety to 4
        const anxietySlider = page.locator('div[role="slider"]').first();
        await anxietySlider.focus();
        await page.keyboard.press('ArrowRight'); // Usually moves from default 3 to 4

        // Let's set Confidence to 2
        const confidenceSlider = page.locator('div[role="slider"]').nth(1);
        await confidenceSlider.focus();
        await page.keyboard.press('ArrowLeft'); // Usually moves from default 3 to 2

        // Fill in notes
        const notesTextbox = page.getByPlaceholder('How is your body feeling right now? Any specific worries?');
        await notesTextbox.fill('Leg feels a bit tight, but ready to go.');

        // 6. Submit the form
        const submitBtn = page.getByRole('button', { name: /Save Game Log/i });
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();

        // 7. Verify we are redirected back to the Home Dashboard
        await page.waitForURL('**/home');

        // Should be on dashboard
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
});
