import { test, expect } from '@playwright/test';

test.describe('Spider Web Click Effects', () => {
    test('should render the Canvas without errors and handle clicks', async ({ page }) => {
        // 1. Navigate to the page
        await page.goto('/');

        // 2. Locate the container where the SpiderWebClick SVGs are mounted
        const container = page.getByTestId('spider-container');

        // Ensure the container is attached to the DOM
        await expect(container).toBeAttached();

        // 3. Ensure no console errors are thrown by React on load
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
        });

        // 4. Simulate clicks on the screen to trigger the web appearance
        await page.mouse.click(100, 100);
        await page.waitForTimeout(100); // Wait for animation frame

        await page.mouse.click(500, 300);
        await page.waitForTimeout(100);

        // Verify SVGs were injected
        const svgs = container.locator('svg');
        await expect(svgs).toHaveCount(2);

        // 5. Verify no errors occurred during initialization and clicking
        expect(errors).toEqual([]); // The errors array should be empty
    });
});
