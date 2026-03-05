import { test, expect } from '@playwright/test';

test.describe('Routine History and Entry Review', () => {
    test('athlete can view history list and details', async ({ page }) => {
        // 0. Log in first (Requires seeded DB user for local testing)
        // Adjust the email/password as needed based on seed data
        await page.goto('/login');
        await page.fill('input[type="email"]', 'athlete@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("Sign in")');
        // Wait for redirect to home
        await page.waitForURL('**/home');

        // 1. Navigate to History from Home
        const historyCard = page.locator('text=View Routine History');
        await expect(historyCard).toBeVisible();
        await historyCard.click();

        // Wait to be on history page
        await page.waitForURL('**/history');

        // 2. Verify History List loads (AC-11.1)
        await expect(page.locator('h1:has-text("Entry History")')).toBeVisible();

        // 3. Check for elements or "No history found"
        // Either they have history cards, or they see the empty state.
        const noHistory = page.locator('text=No history found');
        const historyCards = page.locator('.group').first();

        if (await noHistory.isVisible()) {
            // Test empty state
            await expect(page.locator('text=Try adjusting your filters.')).toBeVisible();
        } else {
            // Test populated state
            await expect(historyCards).toBeVisible();
            // 4. Click into the first detail view (AC-11.2)
            await historyCards.click();
            await page.waitForURL('**/history/*');

            // 5. Verify Detail View loads
            await expect(page.locator('h1:has-text("Entry Details")')).toBeVisible();
            await expect(page.locator('text=Routine Execution')).toBeVisible();

            // Check placeholders
            await expect(page.locator('text=Post-Game Reflection')).toBeVisible();
        }
    });
});
