import { test, expect } from '@playwright/test';

test.describe('Routine Builder User Flow', () => {
    // Assuming a test athlete is already logged in via global setup
    // Or we log them in here for this specific test suite
    test('should allow an athlete to create and save a new routine', async ({ page }) => {
        // 0. Log in first
        await page.goto('/login');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("Sign in")');
        // Wait for redirect to home
        await page.waitForURL('**/home');

        // 1. Navigate to the builder page
        await page.goto('/routine/builder');

        // Check if the page loaded correctly
        await expect(page.locator('h1')).toHaveText('Routine Builder');

        // 2. Add a technique from the library to the routine
        // Find the first technique in the library and click it
        const firstTechnique = page.locator('.space-y-2 > div').first();
        const techniqueName = await firstTechnique.locator('span.font-medium').innerText();
        await firstTechnique.click();

        // Verify it was added to the builder area (the right column)
        const builderArea = page.locator('.space-y-3 > div[role="button"]:has(.cursor-grab)');
        await expect(builderArea).toHaveCount(1);
        await expect(builderArea.first()).toContainText(techniqueName);

        // 3. Add a second technique
        const secondTechnique = page.locator('.space-y-2 > div').nth(1);
        await secondTechnique.click();
        await expect(builderArea).toHaveCount(2);

        // 4. Test the running time estimate
        // Note: We'd normally calculate the expected time here based on the chosen techniques
        const timeBadge = page.locator('.bg-indigo-500\\/10');
        await expect(timeBadge).toContainText('Estimated Time:');

        // 5. Name the routine
        const nameInput = page.getByPlaceholder('Give your routine a name');
        await nameInput.fill('Playwright Test Routine');

        // 6. Save the routine
        const saveButton = page.getByRole('button', { name: /save routine/i });
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        // 7. Verify success and redirection (e.g., to dashboard or home)
        await expect(page.getByText('Routine saved successfully!')).toBeVisible();
        await expect(page).toHaveURL('**/home');

        // 8. Attempt to create a Second Routine
        await page.goto('/routine/builder');
        await expect(page.locator('h1')).toHaveText('Routine Builder');

        const thirdTechnique = page.locator('.space-y-2 > div').nth(2);
        await thirdTechnique.click();

        await nameInput.fill('Second Playwright Routine');
        await saveButton.click();

        await expect(page.getByText('Routine saved successfully!')).toBeVisible();
        await expect(page).toHaveURL('**/home');
    });
});
