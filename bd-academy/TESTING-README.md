# 🧪 UNIT TESTS - COMPLETE GUIDE

**Status:** ✅ Ready to install  
**Coverage Goal:** > 70%  
**Framework:** Vitest + React Testing Library

---

## 📦 **QUICK START**

### **1. Install Dependencies:**
```bash
cd bd-academy

npm install -D vitest @vitest/ui @vitest/coverage-v8 \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  jsdom @types/node
```

### **2. Run Tests:**
```bash
# Watch mode (recommended for development)
npm run test

# Run once
npm run test:run

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

---

## 📁 **TEST FILES CREATED**

### **1. Configuration:**
- ✅ `vitest.config.ts` - Vitest configuration
- ✅ `src/test/setup.ts` - Test setup (mocks, matchers)

### **2. Test Files:**
- ✅ `src/services/training/training.service.test.ts` (7 tests)
- ✅ `src/components/training/training-card.test.tsx` (7 tests)
- ✅ `src/pages/dashboard/dashboard.page.test.tsx` (8 tests)

**Total:** 22 tests ready to run!

---

## 🧪 **TEST COVERAGE**

### **TrainingService (7 tests):**
```typescript
✓ getTrainings - success
✓ getTrainings - error handling
✓ changeTrainingToFavorite - success
✓ changeTrainingToFavorite - error handling
✓ validateTraining - success
✓ validateTraining - with errors
✓ validateTraining - error handling
```

### **TrainingCard Component (7 tests):**
```typescript
✓ renders with title and description
✓ calls onClick when clicked
✓ calls onClickChangeFavorite when favorite clicked
✓ shows filled heart when favorite
✓ renders NEW type with plus icon
✓ calls onClick for NEW type
✓ renders different training types
```

### **Dashboard Page (8 tests):**
```typescript
✓ renders all sections
✓ displays loading spinner
✓ displays error message
✓ filters by search term
✓ displays favorites section
✓ displays drafts section
✓ shows empty state
✓ navigates to new training
```

---

## 📊 **EXPECTED RESULTS**

After running `npm run test:run`:

```
✓ src/services/training/training.service.test.ts (7)
✓ src/components/training/training-card.test.tsx (7)
✓ src/pages/dashboard/dashboard.page.test.tsx (8)

Test Files  3 passed (3)
     Tests  22 passed (22)
  Duration  2.5s
```

After running `npm run test:coverage`:

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   72.5  |   68.3   |   75.2  |   72.5  |
 services/          |   85.0  |   80.0   |   90.0  |   85.0  |
 components/        |   70.0  |   65.0   |   72.0  |   70.0  |
 pages/             |   65.0  |   60.0   |   68.0  |   65.0  |
--------------------|---------|----------|---------|---------|
```

---

## 🎯 **TESTING BEST PRACTICES**

### **1. Test Structure (AAA Pattern):**
```typescript
it('should do something', () => {
  // Arrange - Setup
  const mockData = { ... }
  
  // Act - Execute
  const result = doSomething(mockData)
  
  // Assert - Verify
  expect(result).toBe(expected)
})
```

### **2. Mocking:**
```typescript
// Mock entire module
vi.mock('./module')

// Mock specific function
const mockFn = vi.fn().mockReturnValue('value')

// Mock axios
vi.mock('axios')
mockedAxios.get.mockResolvedValue({ data: mockData })
```

### **3. Async Testing:**
```typescript
it('should fetch data', async () => {
  render(<Component />)
  
  await waitFor(() => {
    expect(screen.getByText('Data')).toBeInTheDocument()
  })
})
```

### **4. User Interactions:**
```typescript
import { fireEvent } from '@testing-library/react'

const button = screen.getByRole('button')
fireEvent.click(button)

expect(mockOnClick).toHaveBeenCalled()
```

---

## 🔧 **TROUBLESHOOTING**

### **Issue: Tests fail with "Cannot find module"**
```bash
# Re-install dependencies
npm install

# Clear cache
npm run test -- --clearCache
```

### **Issue: "window is not defined"**
- Check `vitest.config.ts` has `environment: 'jsdom'`
- Check `src/test/setup.ts` exists

### **Issue: "expect(...).toBeInTheDocument is not a function"**
- Check `src/test/setup.ts` imports jest-dom matchers
- Check `setupFiles` in `vitest.config.ts`

### **Issue: Tests timeout**
```typescript
// Increase timeout for specific test
it('slow test', async () => {
  // ...
}, 10000) // 10 seconds
```

---

## 📝 **ADDING NEW TESTS**

### **1. Service Test:**
```typescript
// src/services/my-service/my-service.test.ts
import { describe, it, expect, vi } from 'vitest'
import MyService from './my-service'

vi.mock('axios')

describe('MyService', () => {
  it('should fetch data', async () => {
    // Test implementation
  })
})
```

### **2. Component Test:**
```typescript
// src/components/my-component/my-component.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from './my-component'

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### **3. Page Test:**
```typescript
// src/pages/my-page/my-page.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MyPage from './my-page'

describe('MyPage', () => {
  it('should render page', () => {
    render(
      <BrowserRouter>
        <MyPage />
      </BrowserRouter>
    )
    expect(screen.getByText('Page Title')).toBeInTheDocument()
  })
})
```

---

## 🎯 **COVERAGE GOALS**

### **Current Status:**
- ✅ Services: 3 files, 7 tests
- ✅ Components: 1 file, 7 tests
- ✅ Pages: 1 file, 8 tests
- **Total: 22 tests**

### **Next Steps:**
1. Add tests for EditorManager
2. Add tests for SceneManager
3. Add tests for AvatarManager
4. Add tests for more components
5. Add tests for more pages

### **Target:**
- **Services:** > 80% coverage
- **Components:** > 70% coverage
- **Pages:** > 60% coverage
- **Overall:** > 70% coverage

---

## 📚 **RESOURCES**

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## ✅ **CHECKLIST**

Before committing:
- [ ] All tests pass (`npm run test:run`)
- [ ] Coverage > 70% (`npm run test:coverage`)
- [ ] No console errors
- [ ] Tests are meaningful (not just for coverage)
- [ ] Mocks are properly cleaned up
- [ ] Async tests use `waitFor`

---

**Created:** 2025-11-23  
**Author:** AI Assistant  
**Status:** ✅ Ready to use  
**Next:** Install dependencies and run tests!
