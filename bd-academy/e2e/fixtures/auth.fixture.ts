import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Authentication fixture
 * Provides authenticated page for tests that require login
 */
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/login')
    
    // Fill login form
    await page.fill('input[type="email"]', 'admin@admin.pl')
    await page.fill('input[type="password"]', 'mju7&UJM')
    
    // Click login button
    await page.click('button[type="submit"]')
    
    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 })
    
    // Verify we're logged in
    await expect(page).toHaveURL('/dashboard')
    
    // Use the authenticated page in tests
    await use(page)
  },
})

export { expect }
