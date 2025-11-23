import { test, expect } from './fixtures/auth.fixture'
import { TrainingHelper } from './helpers/training.helper'

test.describe('Training CRUD Operations', () => {
  let trainingHelper: TrainingHelper

  test.beforeEach(async ({ authenticatedPage }) => {
    trainingHelper = new TrainingHelper(authenticatedPage)
  })

  test('should create a new VR training', async ({ authenticatedPage: page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Click on VR Training card
    await page.click('text=VR Training')
    
    // Wait for navigation to new training page
    await page.waitForURL(/\/trainings\/new\?trainingType=VR/)
    
    // Fill training details
    await page.fill('input[name="title"]', 'E2E Test Training')
    await page.fill('textarea[name="description"]', 'This is a test training created by E2E tests')
    
    // Save training
    await page.click('button:has-text("Save")')
    
    // Wait for success toast
    await expect(page.locator('.p-toast-message-success')).toBeVisible({ timeout: 5000 })
    
    // Verify training appears in list
    await page.goto('/trainings')
    await expect(page.locator('text=E2E Test Training')).toBeVisible()
  })

  test('should edit existing training', async ({ authenticatedPage: page }) => {
    // Create a training first
    await trainingHelper.createTraining('VR')
    await page.fill('input[name="title"]', 'Training to Edit')
    await page.fill('textarea[name="description"]', 'Original description')
    await trainingHelper.saveTraining()
    
    // Navigate to trainings list
    await page.goto('/trainings')
    
    // Click on the training to edit
    await page.click('text=Training to Edit')
    
    // Wait for editor to load
    await page.waitForURL(/\/trainings\/edit/)
    
    // Edit title
    await page.fill('input[name="title"]', 'Edited Training Title')
    
    // Save changes
    await trainingHelper.saveTraining()
    
    // Verify changes
    await page.goto('/trainings')
    await expect(page.locator('text=Edited Training Title')).toBeVisible()
  })

  test('should delete training', async ({ authenticatedPage: page }) => {
    // Create a training first
    await trainingHelper.createTraining('VR')
    await page.fill('input[name="title"]', 'Training to Delete')
    await trainingHelper.saveTraining()
    
    // Navigate to trainings list
    await page.goto('/trainings')
    
    // Enable bulk mode
    await page.click('button:has-text("Select")')
    
    // Select the training
    const trainingCard = page.locator('text=Training to Delete').locator('..')
    await trainingCard.locator('input[type="checkbox"]').check()
    
    // Click delete button
    await page.click('button:has-text("Delete")')
    
    // Confirm deletion in dialog
    await page.click('.p-confirm-dialog button.p-button-danger')
    
    // Wait for success toast
    await expect(page.locator('.p-toast-message-success')).toBeVisible({ timeout: 5000 })
    
    // Verify training is deleted
    await expect(page.locator('text=Training to Delete')).not.toBeVisible()
  })

  test('should search for trainings', async ({ authenticatedPage: page }) => {
    // Create multiple trainings
    await trainingHelper.createTraining('VR')
    await page.fill('input[name="title"]', 'Searchable Training 1')
    await trainingHelper.saveTraining()
    
    await trainingHelper.createTraining('SCENE')
    await page.fill('input[name="title"]', 'Different Training 2')
    await trainingHelper.saveTraining()
    
    // Navigate to trainings list
    await page.goto('/trainings')
    
    // Search for specific training
    await trainingHelper.searchTraining('Searchable')
    
    // Verify only matching training is visible
    await expect(page.locator('text=Searchable Training 1')).toBeVisible()
    await expect(page.locator('text=Different Training 2')).not.toBeVisible()
  })

  test('should toggle favorite status', async ({ authenticatedPage: page }) => {
    // Create a training
    await trainingHelper.createTraining('VR')
    await page.fill('input[name="title"]', 'Favorite Test Training')
    await trainingHelper.saveTraining()
    
    // Toggle favorite
    await trainingHelper.toggleFavorite('Favorite Test Training')
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Verify training appears in favorites section
    const favoritesSection = page.locator('h2:has-text("Favorites")').locator('..')
    await expect(favoritesSection.locator('text=Favorite Test Training')).toBeVisible()
  })

  test('should filter trainings by status', async ({ authenticatedPage: page }) => {
    // Navigate to trainings list
    await page.goto('/trainings')
    
    // Select "Drafts" filter
    await page.click('.filter-dropdown')
    await page.click('text=Drafts')
    
    // Wait for results to update
    await page.waitForTimeout(500)
    
    // Verify results count updates
    const resultsCount = page.locator('text=/Showing \\d+ of \\d+ trainings/')
    await expect(resultsCount).toBeVisible()
  })
})
