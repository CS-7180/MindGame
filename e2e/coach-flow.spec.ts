import { test, expect } from '@playwright/test';

test.describe('Coach Routine Templates Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Log console messages
        page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

        // First we register a new coach to ensure the test passes reliably in any environment
        await page.goto('/signup');
        const uniqueEmail = `coach_${Date.now()}@example.com`;
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', 'coachpassword');
        await page.click('text="Coach"'); // select the Coach role
        await page.click('button:has-text("Create Account")');
        // Because signup routes coaches directly to /coach/home
        await page.waitForURL('**/coach/home');
    });

    test('should allow a coach to create a template and share it', async ({ page }) => {
        console.log('Starting coach flow test...');
        // 1. Navigate to templates page
        await page.goto('/coach/templates');
        console.log('Navigated to /coach/templates');
        await expect(page).toHaveURL(/\/coach\/templates/);

        // 2. Start new template creation
        await page.goto('/coach/templates/new');
        console.log('Navigated to /coach/templates/new');
        await expect(page).toHaveURL(/\/coach\/templates\/new/);

        // 3. Fill template details
        console.log('Filling template details...');
        await page.getByPlaceholder(/e.g., Pre-Game/i).fill('Playoffs Routine', { force: true });

        // Select time tier
        await page.click('button[role="combobox"]');
        await page.click('text="Standard (3–5 min)"', { force: true });

        // Note
        await page.fill('textarea', 'Use this before important games!');

        // 5. Add techniques from library
        console.log('Adding technique...');
        const technique = page.locator('[data-testid^="technique-card-"]').first();
        await technique.scrollIntoViewIfNeeded();
        await technique.click({ force: true });

        // Brief wait to ensure state updates
        await page.waitForTimeout(1000);

        // Verify that at least one step is added
        console.log('Verifying step addition...');
        await expect(page.locator('text="No techniques added"')).not.toBeVisible();
        await expect(page.locator('text="1 step configured"')).toBeVisible();

        // 6. Save Template
        console.log('Saving template...');
        const saveTemplateBtn = page.getByRole('button', { name: /save template/i });
        await saveTemplateBtn.scrollIntoViewIfNeeded();
        await saveTemplateBtn.click();

        // Wait for redirect to templates list (toast may disappear due to router.refresh)
        await expect(page).toHaveURL(/\/coach\/templates/);
        console.log('Template saved.');

        // 7. Share with Team
        console.log('Sharing template...');
        // Mock the share API since a newly created test coach has an empty roster
        await page.route('**/api/coach/templates/*/share', async route => {
            await route.fulfill({
                status: 200,
                json: { data: { success: true, count: 1 }, error: null }
            });
        });

        // The newly created template card should have a Share button
        const shareButton = page.locator('text="Share with Team"').first();
        await shareButton.scrollIntoViewIfNeeded();
        await shareButton.click();

        // Wait for share success
        await expect(page.locator('text="Template Shared"')).toBeVisible();
        console.log('Template shared.');
    });
});
