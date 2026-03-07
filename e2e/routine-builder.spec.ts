import { test, expect } from '@playwright/test';

test.describe('Routine Builder User Flow', () => {
    test('should allow an athlete to create and save a new routine', async ({ page }) => {
        // 0. Sign up a new athlete to ensure a clean state
        await page.goto('/signup');
        const uniqueEmail = `athlete_builder_${Date.now()}@example.com`;
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', 'password123');
        await page.click('text="Athlete"');
        await page.click('button:has-text("Create Account")');

        await page.waitForURL('**/onboarding**');

        // Onboarding flow
        await page.click('[data-testid="sport-basketball"]');
        await page.click('[data-testid="onboarding-next"]');
        await page.click('[data-testid="level-college"]');
        await page.click('[data-testid="onboarding-next"]');
        await page.click('[data-testid="symptom-overthinking"]');
        await page.click('[data-testid="onboarding-next"]');
        await page.click('[data-testid="time-5min"]');
        await page.click('[data-testid="onboarding-complete"]');

        await page.waitForURL('**/onboarding/result');
        await page.goto('/home');

        // 1. Navigate to the builder page
        await page.goto('/routine/builder');
        await expect(page.locator('h1')).toHaveText('Routine Builder');

        // 2. Add techniques from the library
        await page.locator('[data-testid^="technique-item-"]').first().click();
        await page.locator('[data-testid^="technique-item-"]').nth(1).click();

        // Verify items were added to the builder area
        await expect(page.locator('.cursor-move')).toHaveCount(2);

        // 3. Set routine name
        await page.getByPlaceholder(/Routine Name/i).fill('My Playwright Routine');

        // Select sport
        await page.getByRole('combobox').click();
        await page.getByRole('option', { name: 'Basketball' }).click();

        // 4. Save the routine
        const saveButton = page.getByRole('button', { name: /save routine/i });
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        // 5. Verify success and redirection to Home
        await page.waitForURL(/\/home/, { timeout: 15000 });
        await expect(page).toHaveURL(/\/home/);

        // Success!
    });
});
