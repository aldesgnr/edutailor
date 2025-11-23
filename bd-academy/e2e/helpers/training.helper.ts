import type { Page } from '@playwright/test'

/**
 * Helper functions for training-related operations
 */
export class TrainingHelper {
  constructor(private page: Page) {}

  /**
   * Create a new training
   */
  async createTraining(type: 'VR' | 'SCENE' | 'QUIZ' = 'VR') {
    await this.page.goto('/dashboard')
    
    // Click on the training type card
    await this.page.click(`text=${type} Training`)
    
    // Wait for navigation to new training page
    await this.page.waitForURL(/\/trainings\/new/)
    
    return this.page.url()
  }

  /**
   * Fill training details
   */
  async fillTrainingDetails(title: string, description: string) {
    await this.page.fill('input[name="title"]', title)
    await this.page.fill('textarea[name="description"]', description)
  }

  /**
   * Save training
   */
  async saveTraining() {
    await this.page.click('button:has-text("Save")')
    
    // Wait for success toast
    await this.page.waitForSelector('.p-toast-message-success', { timeout: 5000 })
  }

  /**
   * Delete training
   */
  async deleteTraining(trainingId: string) {
    await this.page.goto('/trainings')
    
    // Find training card and click delete
    const trainingCard = this.page.locator(`[data-training-id="${trainingId}"]`)
    await trainingCard.hover()
    await trainingCard.locator('button[aria-label="Delete"]').click()
    
    // Confirm deletion
    await this.page.click('button:has-text("Yes")')
    
    // Wait for success toast
    await this.page.waitForSelector('.p-toast-message-success', { timeout: 5000 })
  }

  /**
   * Search for training
   */
  async searchTraining(searchTerm: string) {
    await this.page.goto('/trainings')
    
    const searchInput = this.page.locator('input[placeholder*="Search"]')
    await searchInput.fill(searchTerm)
    
    // Wait for results to update
    await this.page.waitForTimeout(500)
  }

  /**
   * Toggle favorite
   */
  async toggleFavorite(trainingTitle: string) {
    const trainingCard = this.page.locator(`text=${trainingTitle}`).locator('..')
    await trainingCard.locator('button[aria-label*="favorite"]').click()
    
    // Wait for success toast
    await this.page.waitForSelector('.p-toast-message-success', { timeout: 5000 })
  }

  /**
   * Navigate to editor
   */
  async openEditor(trainingTitle: string) {
    await this.page.goto('/trainings')
    
    const trainingCard = this.page.locator(`text=${trainingTitle}`)
    await trainingCard.click()
    
    // Wait for editor to load
    await this.page.waitForURL(/\/trainings\/edit/)
    await this.page.waitForSelector('canvas', { timeout: 10000 })
  }
}
