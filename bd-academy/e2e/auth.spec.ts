import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page).toHaveTitle(/EduTailor|Academy/)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill login form
    await page.fill('input[type="email"]', 'admin@admin.pl')
    await page.fill('input[type="password"]', 'mju7&UJM')
    
    // Click login button
    await page.click('button[type="submit"]')
    
    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 })
    
    // Verify we're on dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h2:has-text("Create new")')).toBeVisible()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill login form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    
    // Click login button
    await page.click('button[type="submit"]')
    
    // Wait for error message
    await expect(page.locator('.p-toast-message-error')).toBeVisible({ timeout: 5000 })
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@admin.pl')
    await page.fill('input[type="password"]', 'mju7&UJM')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Click logout button
    await page.click('button[aria-label="Logout"]')
    
    // Verify we're back on login page
    await expect(page).toHaveURL('/login')
  })

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })
})
