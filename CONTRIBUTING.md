# 🤝 CONTRIBUTING GUIDE

**Guidelines for contributing to EduTailor.ai**

---

## 📋 **TABLE OF CONTENTS**

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Testing Requirements](#testing-requirements)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Code Review](#code-review)

---

## 🚀 **GETTING STARTED**

### **1. Fork & Clone:**
```bash
# Fork repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/edutailor.git
cd edutailor

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/edutailor.git
```

### **2. Setup Development Environment:**
```bash
# Install dependencies
cd bd-academy
npm install

# Start services
cd ..
./start-all.sh

# Verify setup
open http://localhost:5173
```

### **3. Create Branch:**
```bash
# Update main
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or bugfix branch
git checkout -b fix/bug-description
```

---

## 💻 **DEVELOPMENT WORKFLOW**

### **1. Pick a Task:**
- Check [ROADMAP-2025.md](ROADMAP-2025.md) for planned features
- Check [DOCS/KNOWN-ISSUES.md](DOCS/KNOWN-ISSUES.md) for bugs
- Check GitHub Issues for open tasks

### **2. Implement:**
```bash
# Make changes
# Test locally
npm run test:run
npm run test:e2e

# Lint & format
npm run lint
npm run format
```

### **3. Commit:**
```bash
# Stage changes
git add .

# Commit with conventional format
git commit -m "feat: add new feature"

# Push to your fork
git push origin feature/your-feature-name
```

### **4. Create Pull Request:**
- Go to GitHub
- Create Pull Request from your branch to `main`
- Fill in PR template
- Wait for CI checks
- Address review comments

---

## 📏 **CODE STANDARDS**

### **TypeScript/JavaScript:**

#### **Naming Conventions:**
```typescript
// PascalCase for components, classes, types
class EditorManager { }
interface TrainingData { }
type ValidationResult = { }

// camelCase for variables, functions
const trainingList = []
function loadTraining() { }

// UPPER_CASE for constants
const MAX_HISTORY_SIZE = 50
const API_BASE_URL = 'http://localhost:5007'

// kebab-case for files
// training-card.component.tsx
// editor-manager.ts
```

#### **Code Style:**
```typescript
// Use TypeScript strict mode
// Use explicit types
function getTraining(id: string): Promise<TrainingData> {
  return fetch(`/api/trainings/${id}`)
}

// Use async/await over promises
async function loadTraining() {
  try {
    const data = await getTraining(id)
    return data
  } catch (error) {
    console.error('Failed to load training:', error)
    throw error
  }
}

// Use optional chaining
const title = training?.title ?? 'Untitled'

// Use template literals
const message = `Training ${id} loaded successfully`

// Use arrow functions for callbacks
trainings.map(t => t.title)
```

#### **React Best Practices:**
```typescript
// Use functional components
export const TrainingCard: React.FC<Props> = ({ training }) => {
  // Use hooks at top level
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  // Use useCallback for event handlers
  const handleClick = useCallback(() => {
    navigate(`/trainings/${training.id}`)
  }, [training.id, navigate])
  
  // Use useMemo for expensive computations
  const filteredItems = useMemo(() => {
    return items.filter(item => item.active)
  }, [items])
  
  return (
    <div onClick={handleClick}>
      {training.title}
    </div>
  )
}
```

### **C# (.NET):**

#### **Naming Conventions:**
```csharp
// PascalCase for classes, methods, properties
public class TrainingService
{
    public async Task<Training> GetTrainingAsync(Guid id)
    {
        // Implementation
    }
    
    public string Title { get; set; }
}

// camelCase for parameters, local variables
public void ProcessTraining(Training training)
{
    var trainingId = training.Id;
}

// _camelCase for private fields
private readonly ILogger _logger;
```

#### **Code Style:**
```csharp
// Use async/await
public async Task<ActionResult<Training>> GetTraining(Guid id)
{
    var training = await _context.Training.FindAsync(id);
    if (training == null)
    {
        return NotFound();
    }
    return Ok(training);
}

// Use LINQ
var drafts = trainings.Where(t => t.Type == "DRAFT").ToList();

// Use null-conditional operator
var title = training?.Title ?? "Untitled";

// Use string interpolation
var message = $"Training {id} loaded successfully";
```

---

## 🧪 **TESTING REQUIREMENTS**

### **Unit Tests:**

#### **Required for:**
- All services
- All utility functions
- All complex components

#### **Test Structure (AAA Pattern):**
```typescript
describe('TrainingService', () => {
  describe('getTrainings', () => {
    it('should fetch trainings successfully', async () => {
      // Arrange
      const mockData = [{ id: '1', title: 'Test' }]
      vi.mocked(axios.get).mockResolvedValue({ data: mockData })
      
      // Act
      const result = await TrainingService.getTrainings()
      
      // Assert
      expect(result.data).toEqual(mockData)
      expect(axios.get).toHaveBeenCalledWith('/api/Trainings')
    })
    
    it('should handle errors', async () => {
      // Arrange
      vi.mocked(axios.get).mockRejectedValue(new Error('Network error'))
      
      // Act & Assert
      await expect(TrainingService.getTrainings()).rejects.toThrow('Network error')
    })
  })
})
```

#### **Coverage Requirements:**
- **Services:** >80%
- **Components:** >70%
- **Pages:** >60%
- **Overall:** >70%

### **E2E Tests:**

#### **Required for:**
- Critical user flows
- Authentication
- CRUD operations
- Editor workflows

#### **Test Structure:**
```typescript
test('should create and publish training', async ({ page }) => {
  // Navigate
  await page.goto('/dashboard')
  
  // Action
  await page.click('text=New Training')
  await page.fill('#title', 'Test Training')
  await page.click('text=Save')
  
  // Assert
  await expect(page.locator('.success-message')).toBeVisible()
})
```

### **Running Tests:**
```bash
# Before committing
npm run test:run
npm run test:e2e

# Check coverage
npm run test:coverage
```

---

## 📝 **COMMIT GUIDELINES**

### **Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

### **Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks
- `ci:` CI/CD changes
- `perf:` Performance improvements

### **Examples:**
```bash
# Feature
git commit -m "feat(editor): add undo/redo functionality"

# Bug fix
git commit -m "fix(auth): resolve login redirect issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Multiple changes
git commit -m "feat(training): add search and filtering

- Add search input
- Add filter dropdown
- Add results counter
- Update tests

Closes #123"
```

### **Rules:**
- Use present tense ("add" not "added")
- Use imperative mood ("move" not "moves")
- Limit first line to 72 characters
- Reference issues/PRs in footer
- Explain "what" and "why", not "how"

---

## 🔄 **PULL REQUEST PROCESS**

### **1. Before Creating PR:**
```bash
# Update your branch
git checkout main
git pull upstream main
git checkout feature/your-feature
git rebase main

# Run all checks
npm run lint
npm run test:run
npm run test:e2e
npm run build

# Push to your fork
git push origin feature/your-feature --force-with-lease
```

### **2. Create PR:**
- Use descriptive title
- Fill in PR template
- Link related issues
- Add screenshots/videos if UI changes
- Request reviewers

### **3. PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
- [ ] Dependent changes merged

## Related Issues
Closes #123
```

### **4. After PR Created:**
- Wait for CI checks to pass
- Address review comments
- Update PR if needed
- Merge when approved

---

## 👀 **CODE REVIEW**

### **As Reviewer:**

#### **Check for:**
- ✅ Code follows style guidelines
- ✅ Tests are adequate
- ✅ Documentation is updated
- ✅ No security issues
- ✅ Performance is acceptable
- ✅ Error handling is proper
- ✅ Edge cases are covered

#### **Review Checklist:**
```markdown
- [ ] Code is readable and maintainable
- [ ] Logic is correct
- [ ] Tests cover new code
- [ ] No hardcoded values
- [ ] No console.log statements
- [ ] Error messages are user-friendly
- [ ] Performance is acceptable
- [ ] Security best practices followed
- [ ] Documentation updated
```

#### **Feedback Guidelines:**
- Be constructive and respectful
- Explain "why" not just "what"
- Suggest alternatives
- Praise good code
- Use "we" not "you"

#### **Example Comments:**
```markdown
✅ Good:
"We could improve performance here by using useMemo. 
This computation runs on every render."

❌ Bad:
"This is slow."

✅ Good:
"Great use of TypeScript here! The types make this very clear."

✅ Good:
"Consider extracting this logic into a separate function 
for better testability."
```

### **As Author:**

#### **Responding to Reviews:**
- Address all comments
- Ask for clarification if needed
- Explain your reasoning
- Be open to suggestions
- Thank reviewers

#### **Making Changes:**
```bash
# Make requested changes
git add .
git commit -m "refactor: address review comments"
git push origin feature/your-feature
```

---

## 🐛 **REPORTING BUGS**

### **Bug Report Template:**
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
(if applicable)

## Environment
- OS: [e.g. macOS 14.0]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]

## Additional Context
Any other relevant information
```

---

## 💡 **FEATURE REQUESTS**

### **Feature Request Template:**
```markdown
## Feature Description
Clear description of the feature

## Problem it Solves
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
What other solutions did you consider?

## Additional Context
Any other relevant information
```

---

## 📚 **RESOURCES**

### **Documentation:**
- [README.md](README.md) - Project overview
- [QUICK-START.md](QUICK-START.md) - Quick start
- [ROADMAP-2025.md](ROADMAP-2025.md) - Development roadmap
- [DOCS/](DOCS/) - Detailed documentation

### **Tools:**
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [PrimeReact](https://primereact.org/)

---

## ❓ **QUESTIONS?**

- Check [FAQ](DOCS/FAQ.md)
- Ask in GitHub Discussions
- Join Slack: #edutailor-dev
- Email: dev@edutailor.ai

---

## 🙏 **THANK YOU!**

Thank you for contributing to EduTailor.ai! Every contribution, no matter how small, helps make this project better.

**Happy coding!** 🚀

---

**Last Updated:** 2025-11-23  
**Version:** 1.0.0  
**Status:** Active
