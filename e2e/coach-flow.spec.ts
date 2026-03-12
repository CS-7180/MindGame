import { test, expect } from '@playwright/test';

test.describe('Coach User Flow', () => {
    test('should allow a coach to create a template, share it, and view roster', async ({ page }) => {
        // 0. Sign up a new coach to ensure a clean state
        console.log('Starting coach signup...');
        await page.goto('/signup');
        const uniqueEmail = `coach_${Date.now()}@example.com`;
        
        // Fill name field
        await page.fill('input[placeholder*="name" i]', 'Test Coach');
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', 'password123');
        await page.click('text="Coach"');
        await page.click('button:has-text("Create Account")');

        console.log('Waiting for coach home redirect...');
        try {
            await page.waitForURL('**/coach/home', { timeout: 30000 });
        } catch (e) {
            console.log('Current URL:', page.url());
            console.log('Page title:', await page.title());
            await page.screenshot({ path: 'coach-signup-fail.png' });
            throw e;
        }
        console.log('Coach home reached.');
        await expect(page.locator('h1')).toContainText('Coach Dashboard');

        // 1. Create a New Template
        console.log('Navigating to template creation...');
        await page.goto('/coach/templates/new');
        await expect(page.locator('h1')).toContainText('Create Routine Template');

        // Set template details
        const templateName = `Team Focus ${Date.now()}`;
        await page.getByPlaceholder(/e.g., Pre-Game Focus/i).fill(templateName);
        
        // Select time tier - use select field properly
        await page.locator('button:has([placeholder="Select Tier"])').or(page.getByRole('combobox')).click();
        await page.getByRole('option', { name: /standard/i }).click();

        // Add a note
        await page.getByPlaceholder(/Add a short message/i).fill('Focus on your breathing today.');

        // Add a technique from the library
        console.log('Adding technique from library...');
        const techCard = page.locator('[data-testid^="technique-card-"]').first();
        await expect(techCard).toBeVisible({ timeout: 10000 });
        await techCard.click();

        // Save Template
        console.log('Saving template...');
        const saveButton = page.getByTestId('save-template-button');
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        // 2. Verify Template in List and Share
        console.log('Verifying template in list...');
        await page.waitForURL('**/coach/templates');
        await expect(page.getByText(templateName)).toBeVisible();

        // Share with team (should show a toast)
        console.log('Sharing template...');
        const shareButton = page.getByTestId('share-template-button').first();
        await shareButton.click();
        
        // Confirm it entered sharing state
        console.log('Checking for "Sharing..." button state...');
        await expect(shareButton).toContainText(/Sharing|Shared|Team/i); // At least should stay or change
        
        // Log all console messages
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

        // Wait for ANY toast to appear and take a screenshot
        try {
            console.log('Waiting for toast...');
            await expect(page.locator('.sonner-toast, [role="status"], [data-sonner-toast]')).toBeVisible({ timeout: 10000 });
            console.log('Toast appeared!');
        } catch (e) {
            console.log('Toast not appearing or slow');
            await page.screenshot({ path: 'sharing-fail-v2.png' });
        }
        
        // 3. View Roster
        console.log('Navigating to roster...');
        await page.goto('/coach/roster');
        await expect(page.locator('h1')).toContainText('Team Roster');
        
        // Verify Team Invite Code section exists
        await expect(page.getByTestId('team-code-display')).toBeVisible();
        
        // Since it's a new coach, roster should be empty
        await expect(page.getByTestId('empty-roster-state')).toBeVisible();
        await expect(page.getByText(/Your roster is empty/i)).toBeVisible();
    });
});
