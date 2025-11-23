import { test, expect } from './fixtures/auth.fixture'
import { TrainingHelper } from './helpers/training.helper'

test.describe('Editor Workflow', () => {
  let trainingHelper: TrainingHelper

  test.beforeEach(async ({ authenticatedPage }) => {
    trainingHelper = new TrainingHelper(authenticatedPage)
    
    // Create a training for testing
    await trainingHelper.createTraining('VR')
    await authenticatedPage.fill('input[name="title"]', 'Editor Test Training')
    await trainingHelper.saveTraining()
  })

  test('should load editor with 3D canvas', async ({ authenticatedPage: page }) => {
    // Open editor
    await trainingHelper.openEditor('Editor Test Training')
    
    // Verify canvas is loaded
    await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 })
    
    // Verify editor panels are visible
    await expect(page.locator('text=Persons')).toBeVisible()
    await expect(page.locator('text=Scripts')).toBeVisible()
  })

  test('should switch between editor tabs', async ({ authenticatedPage: page }) => {
    await trainingHelper.openEditor('Editor Test Training')
    
    // Wait for canvas to load
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Click on Scripts tab
    await page.click('text=Scripts')
    
    // Verify Scripts tab is active
    await expect(page.locator('.tab-scripts.active')).toBeVisible()
    
    // Click back to Persons tab
    await page.click('text=Persons')
    
    // Verify Persons tab is active
    await expect(page.locator('.tab-persons.active')).toBeVisible()
  })

  test('should display autosave notification', async ({ authenticatedPage: page }) => {
    await trainingHelper.openEditor('Editor Test Training')
    
    // Wait for canvas
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Make a change (e.g., change title)
    await page.fill('input[name="title"]', 'Modified Title')
    
    // Wait for autosave (30 seconds + buffer)
    await page.waitForSelector('.p-toast-message-info:has-text("Auto-saved")', { timeout: 35000 })
    
    // Verify autosave notification
    await expect(page.locator('.p-toast-message-info')).toContainText('Auto-saved')
  })

  test('should undo and redo changes', async ({ authenticatedPage: page }) => {
    await trainingHelper.openEditor('Editor Test Training')
    
    // Wait for canvas
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Make a change
    const originalTitle = await page.inputValue('input[name="title"]')
    await page.fill('input[name="title"]', 'Changed Title')
    
    // Undo (Ctrl+Z or Cmd+Z)
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Z' : 'Control+Z')
    
    // Wait for undo toast
    await expect(page.locator('.p-toast-message-info:has-text("Undo")')).toBeVisible({ timeout: 5000 })
    
    // Verify title is back to original
    await expect(page.locator('input[name="title"]')).toHaveValue(originalTitle)
    
    // Redo (Ctrl+Y or Cmd+Shift+Z)
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Shift+Z' : 'Control+Y')
    
    // Wait for redo toast
    await expect(page.locator('.p-toast-message-info:has-text("Redo")')).toBeVisible({ timeout: 5000 })
    
    // Verify title is changed again
    await expect(page.locator('input[name="title"]')).toHaveValue('Changed Title')
  })

  test('should navigate between scene and dialog editor', async ({ authenticatedPage: page }) => {
    await trainingHelper.openEditor('Editor Test Training')
    
    // Wait for canvas
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Click on Dialog editor tab
    await page.click('text=Dialog')
    
    // Wait for dialog editor to load
    await page.waitForURL(/\/dialog/)
    await expect(page.locator('.rete-editor')).toBeVisible({ timeout: 10000 })
    
    // Go back to Scene editor
    await page.click('text=Scene')
    
    // Wait for scene editor to load
    await page.waitForURL(/\/editor/)
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 })
  })

  test('should validate training before publish', async ({ authenticatedPage: page }) => {
    await trainingHelper.openEditor('Editor Test Training')
    
    // Wait for canvas
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Try to publish without completing training
    await page.click('button:has-text("Publish")')
    
    // Should show validation errors
    await expect(page.locator('.p-toast-message-error')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=/validation|incomplete|required/i')).toBeVisible()
  })

  test('should save scene changes', async ({ authenticatedPage: page }) => {
    await trainingHelper.openEditor('Editor Test Training')
    
    // Wait for canvas
    await page.waitForSelector('canvas', { timeout: 15000 })
    
    // Click save button
    await page.click('button:has-text("Save")')
    
    // Wait for success toast
    await expect(page.locator('.p-toast-message-success')).toBeVisible({ timeout: 5000 })
    
    // Refresh page
    await page.reload()
    
    // Verify changes persisted
    await page.waitForSelector('canvas', { timeout: 15000 })
    await expect(page.locator('canvas')).toBeVisible()
  })
})
