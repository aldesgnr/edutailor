# 🧪 UNIT TESTS - INSTALLATION GUIDE

## 📦 **STEP 1: Install Dependencies**

```bash
cd bd-academy

# Install Vitest and testing libraries
npm install -D vitest @vitest/ui @vitest/coverage-v8

# Install React Testing Library
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Install jsdom for DOM simulation
npm install -D jsdom

# Install types
npm install -D @types/node
```

## 📝 **STEP 2: Update package.json**

Add test scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## ⚙️ **STEP 3: Configuration Files**

Already created:
- ✅ `vitest.config.ts` - Vitest configuration
- ✅ `src/test/setup.ts` - Test setup file

## 🚀 **STEP 4: Run Tests**

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 📊 **Expected Output:**

```
✓ src/services/training/training.service.test.ts (3)
✓ src/components/training/training-card.test.tsx (2)
✓ src/pages/dashboard/dashboard.page.test.tsx (4)

Test Files  3 passed (3)
Tests  9 passed (9)
Duration  2.34s
```

## 🎯 **Coverage Goals:**

- **Overall:** > 70%
- **Services:** > 80%
- **Components:** > 70%
- **Pages:** > 60%

## 📁 **Test File Structure:**

```
bd-academy/
├── src/
│   ├── test/
│   │   └── setup.ts
│   ├── services/
│   │   └── training/
│   │       ├── training.service.ts
│   │       └── training.service.test.ts
│   ├── components/
│   │   └── training/
│   │       ├── training-card.component.tsx
│   │       └── training-card.test.tsx
│   └── pages/
│       └── dashboard/
│           ├── dashboard.page.tsx
│           └── dashboard.page.test.tsx
├── vitest.config.ts
└── package.json
```

## ✅ **Verification:**

After installation, verify setup:

```bash
# Check if vitest is installed
npm list vitest

# Run a simple test
npm run test:run
```

## 🐛 **Troubleshooting:**

### Issue: "Cannot find module 'vitest'"
```bash
npm install -D vitest
```

### Issue: "Cannot find module '@testing-library/react'"
```bash
npm install -D @testing-library/react @testing-library/jest-dom
```

### Issue: "ReferenceError: window is not defined"
- Check `vitest.config.ts` has `environment: 'jsdom'`
- Check `src/test/setup.ts` exists

## 📚 **Resources:**

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

**Status:** Ready to install  
**Time:** ~10 min  
**Next:** Write tests
