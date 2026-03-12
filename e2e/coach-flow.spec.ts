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
        const nameInput = page.getByPlaceholder(/e.g., Pre-Game/i);
        await expect(nameInput).toBeVisible({ timeout: 10000 });
        await nameInput.fill('Playoffs Routine');

        // Select time tier
        await page.click('button[role="combobox"]');
        await page.click('text="Standard (3–5 min)"', { force: true });

        // Note
        await page.fill('textarea', 'Use this before important games!');

        // 5. Add techniques from library
        // Wait for techniques to load from DB
        console.log('Adding technique...');
        const technique = page.locator('[data-testid^="technique-card-"]').first();
        await expect(technique).toBeVisible({ timeout: 15000 });

        // Use standard click instead of dispatchEvent for better reliability
        await technique.click();

        // Wait for state update (technique being added to the builder)
        console.log('Verifying step addition...');
        // Wait for either the "No techniques added" to disappear or the step count to appear
        await expect(page.locator('text=/1 step/i')).toBeVisible({ timeout: 15000 });

        // 6. Save Template
        console.log('Saving template...');
        const saveTemplateBtn = page.getByTestId('save-template-button').first();
        await expect(saveTemplateBtn).toBeEnabled();
        await saveTemplateBtn.click();

        // Wait for redirect to templates list and ensure list container is visible
        console.log('Waiting for redirect to /coach/templates...');
        await expect(page).toHaveURL(/\/coach\/templates/, { timeout: 15000 });
        
        // Wait for the template list to be populated (either a template card or the empty state)
        await expect(page.locator('[data-testid="template-card"]').first().or(page.getByText(/No templates yet/i))).toBeVisible({ timeout: 15000 });
        console.log('Template saved and list rendered.');

        // 7. Share with Team
        console.log('Sharing template...');
        // Mock the share API since a newly created test coach has an empty roster
        await page.route('**/api/coach/templates/*/share', async route => {
            await route.fulfill({
                status: 200,
                json: { data: { success: true, count: 1, sharedCount: 1 }, error: null }
            });
        });

        // Wait for the newly created template card to have a Share button
        const firstCard = page.getByTestId('template-card').first();
        await expect(firstCard).toBeVisible({ timeout: 15000 });
        
        const shareButton = firstCard.getByTestId('share-template-button').first();
        await expect(shareButton).toBeVisible({ timeout: 15000 });
        await shareButton.scrollIntoViewIfNeeded();
        await shareButton.click({ force: true });

        // Wait for share success toast
        await expect(page.locator('text=/sent to 1/i')).toBeVisible({ timeout: 15000 });
        console.log('Template shared.');
    });
});
