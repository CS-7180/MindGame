import { test, expect } from '@playwright/test';

test.describe('Routine Builder User Flow', () => {
    // Assuming a test athlete is already logged in via global setup
    // Or we log them in here for this specific test suite
    test('should allow an athlete to create and save a new routine', async ({ page }) => {
        // 0. Sign up a new athlete
        await page.goto('/signup');
        const uniqueEmail = `athlete_builder_${Date.now()}@example.com`;
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', 'password123');
        await page.click('text="Athlete"');
        await page.click('button:has-text("Create Account")');

        // Wait for redirect to home or onboarding
        // If onboarding appears, we might need to skip or fill it, but usually signup goes to /home or /onboarding
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

        // 1. Navigate to the builder page
        await page.goto('/routine/builder');

        // Check if the page loaded correctly
        await expect(page.locator('h1')).toHaveText('Routine Builder');

        // 2. Add a technique from the library to the routine
        // Find the first technique in the library and click it
        const firstTechnique = page.locator('[data-testid^="technique-item-"]').first();
        const techniqueName = await firstTechnique.locator('span.font-semibold').innerText();
        await firstTechnique.click();

        // Verify it was added to the builder area (the right column)
        const builderAreaItems = page.locator('.cursor-move');
        await expect(builderAreaItems).toHaveCount(1);

        // 3. Add a second technique
        const secondTechnique = page.locator('[data-testid^="technique-item-"]').nth(1);
        await secondTechnique.click();
        await expect(builderAreaItems).toHaveCount(2);

        // 4. Test the running time estimate
        // Note: We'd normally calculate the expected time here based on the chosen techniques
        const timeBadge = page.getByText(/Estimated Time:/i);
        await expect(timeBadge).toBeVisible();

        // 4. Set routine name
        const nameInput = page.getByPlaceholder(/Give your routine a name/i);
        await nameInput.fill('My New Routine', { force: true });
        // Ensure the value is actually there
        await expect(nameInput).toHaveValue('My New Routine');

        // 6. Save the routine
        const saveButton = page.getByRole('button', { name: /save routine/i });
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        // 7. Verify success and redirection (e.g., to dashboard or home)
        await expect(page).toHaveURL(/\/home/);

        // 8. Attempt to create a Second Routine
        await page.goto('/routine/builder');
        await page.waitForLoadState('networkidle');

        const thirdTechnique = page.locator('[data-testid^="technique-item-"]').nth(2);
        await thirdTechnique.scrollIntoViewIfNeeded();
        await thirdTechnique.click({ force: true });

        await nameInput.fill('Second Playwright Routine');
        await saveButton.click();

        // Verify redirect to home (toast may disappear due to router.refresh)
        await expect(page).toHaveURL(/\/home/);
    });
});
