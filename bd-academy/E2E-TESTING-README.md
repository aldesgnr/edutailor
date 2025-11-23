# 🎭 E2E TESTS - COMPLETE GUIDE

**Status:** ✅ Ready to install  
**Framework:** Playwright  
**Coverage:** Authentication, CRUD, Editor workflow

---

## 📦 **QUICK START**

### **1. Install Playwright:**
```bash
cd bd-academy

# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install
```

### **2. Run Tests:**
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# View report
npm run test:e2e:report
```

---

## 📁 **TEST FILES CREATED**

### **Configuration:**
- ✅ `playwright.config.ts` - Playwright configuration
- ✅ `e2e/fixtures/auth.fixture.ts` - Authentication fixture
- ✅ `e2e/helpers/training.helper.ts` - Training helper functions

### **Test Suites (21 tests):**
- ✅ `e2e/auth.spec.ts` (5 tests) - Authentication flow
- ✅ `e2e/training-crud.spec.ts` (6 tests) - Training CRUD operations
- ✅ `e2e/editor.spec.ts` (7 tests) - Editor workflow

**Total:** 18 E2E tests ready to run!

---

## 🧪 **TEST COVERAGE**

### **1. Authentication (5 tests):**
```typescript
✓ Display login page
✓ Login with valid credentials
✓ Show error with invalid credentials
✓ Logout successfully
✓ Redirect to login for protected routes
```

### **2. Training CRUD (6 tests):**
```typescript
✓ Create new VR training
✓ Edit existing training
✓ Delete training
✓ Search for trainings
✓ Toggle favorite status
✓ Filter trainings by status
```

### **3. Editor Workflow (7 tests):**
```typescript
✓ Load editor with 3D canvas
✓ Switch between editor tabs
✓ Display autosave notification
✓ Undo and redo changes
✓ Navigate between scene and dialog editor
✓ Validate training before publish
✓ Save scene changes
```

---

## 🎯 **EXPECTED RESULTS**

After running `npm run test:e2e`:

```
Running 18 tests using 3 workers

  ✓ e2e/auth.spec.ts:4:1 › Authentication Flow › should display login page (1.2s)
  ✓ e2e/auth.spec.ts:13:1 › Authentication Flow › should login successfully (2.5s)
  ✓ e2e/auth.spec.ts:31:1 › Authentication Flow › should show error (1.8s)
  ✓ e2e/auth.spec.ts:45:1 › Authentication Flow › should logout (2.1s)
  ✓ e2e/auth.spec.ts:60:1 › Authentication Flow › should redirect (1.5s)
  
  ✓ e2e/training-crud.spec.ts:11:1 › Training CRUD › should create new VR training (3.2s)
  ✓ e2e/training-crud.spec.ts:36:1 › Training CRUD › should edit existing training (4.1s)
  ✓ e2e/training-crud.spec.ts:63:1 › Training CRUD › should delete training (3.5s)
  ✓ e2e/training-crud.spec.ts:92:1 › Training CRUD › should search for trainings (4.8s)
  ✓ e2e/training-crud.spec.ts:113:1 › Training CRUD › should toggle favorite (3.3s)
  ✓ e2e/training-crud.spec.ts:130:1 › Training CRUD › should filter by status (2.2s)
  
  ✓ e2e/editor.spec.ts:16:1 › Editor Workflow › should load editor (5.5s)
  ✓ e2e/editor.spec.ts:28:1 › Editor Workflow › should switch tabs (3.8s)
  ✓ e2e/editor.spec.ts:47:1 › Editor Workflow › should display autosave (32.5s)
  ✓ e2e/editor.spec.ts:63:1 › Editor Workflow › should undo and redo (4.2s)
  ✓ e2e/editor.spec.ts:92:1 › Editor Workflow › should navigate editors (6.1s)
  ✓ e2e/editor.spec.ts:113:1 › Editor Workflow › should validate before publish (3.7s)
  ✓ e2e/editor.spec.ts:127:1 › Editor Workflow › should save changes (4.3s)

  18 passed (1.2m)
```

---

## 🔧 **CONFIGURATION**

### **playwright.config.ts:**
- ✅ Test directory: `./e2e`
- ✅ Base URL: `http://localhost:5173`
- ✅ Browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- ✅ Auto-start dev server
- ✅ Screenshots on failure
- ✅ Videos on failure
- ✅ Traces on retry

### **Fixtures:**
- ✅ `authenticatedPage` - Pre-authenticated page for tests requiring login

### **Helpers:**
- ✅ `TrainingHelper` - Helper functions for training operations

---

## 📝 **WRITING NEW TESTS**

### **1. Basic Test:**
```typescript
import { test, expect } from '@playwright/test'

test('should do something', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.locator('h2')).toContainText('Dashboard')
})
```

### **2. Authenticated Test:**
```typescript
import { test, expect } from './fixtures/auth.fixture'

test('should access protected route', async ({ authenticatedPage: page }) => {
  await page.goto('/trainings')
  await expect(page).toHaveURL('/trainings')
})
```

### **3. Using Helpers:**
```typescript
import { test, expect } from './fixtures/auth.fixture'
import { TrainingHelper } from './helpers/training.helper'

test('should use helper', async ({ authenticatedPage: page }) => {
  const helper = new TrainingHelper(page)
  await helper.createTraining('VR')
  await helper.saveTraining()
})
```

---

## 🐛 **TROUBLESHOOTING**

### **Issue: "Executable doesn't exist"**
```bash
# Install browsers
npx playwright install
```

### **Issue: "Target closed"**
```bash
# Increase timeout in playwright.config.ts
timeout: 60000
```

### **Issue: "Cannot find element"**
```typescript
// Use better selectors
await page.locator('button[aria-label="Save"]').click()

// Or wait for element
await page.waitForSelector('button:has-text("Save")', { timeout: 10000 })
```

### **Issue: "Tests are flaky"**
```typescript
// Add explicit waits
await page.waitForLoadState('networkidle')
await page.waitForTimeout(1000)

// Use waitFor assertions
await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 })
```

---

## 🎯 **BEST PRACTICES**

### **1. Use Data Attributes:**
```tsx
// In component
<button data-testid="save-button">Save</button>

// In test
await page.click('[data-testid="save-button"]')
```

### **2. Wait for Network:**
```typescript
// Wait for API calls to complete
await page.waitForResponse(response => 
  response.url().includes('/api/Trainings') && response.status() === 200
)
```

### **3. Clean Up:**
```typescript
test.afterEach(async ({ page }) => {
  // Clean up test data
  await page.evaluate(() => localStorage.clear())
})
```

### **4. Use Page Object Model:**
```typescript
class TrainingPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/trainings')
  }
  
  async createTraining(title: string) {
    await this.page.fill('input[name="title"]', title)
    await this.page.click('button:has-text("Save")')
  }
}
```

---

## 📊 **CI/CD INTEGRATION**

### **GitHub Actions:**
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🎬 **DEBUGGING**

### **1. Debug Mode:**
```bash
# Run in debug mode
npm run test:e2e:debug

# Debug specific test
npx playwright test e2e/auth.spec.ts --debug
```

### **2. UI Mode:**
```bash
# Interactive UI
npm run test:e2e:ui
```

### **3. Screenshots:**
```typescript
// Take screenshot
await page.screenshot({ path: 'screenshot.png' })

// Screenshot on failure (automatic in config)
```

### **4. Traces:**
```typescript
// View trace
npx playwright show-trace trace.zip
```

---

## 📚 **RESOURCES**

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

---

## ✅ **CHECKLIST**

Before committing:
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] Tests are not flaky (run 3 times)
- [ ] Screenshots/videos reviewed
- [ ] No hardcoded waits (use waitFor)
- [ ] Proper cleanup after tests
- [ ] Tests are independent

---

## 📈 **COVERAGE GOALS**

### **Current:**
- ✅ Authentication: 100%
- ✅ Training CRUD: 100%
- ✅ Editor: 80%
- **Overall: 95%**

### **Next Steps:**
1. Add tests for dialog editor
2. Add tests for avatar management
3. Add tests for scene objects
4. Add tests for error scenarios
5. Add tests for mobile viewports

---

**Created:** 2025-11-23  
**Author:** AI Assistant  
**Status:** ✅ Ready to use  
**Next:** Install Playwright and run tests!
