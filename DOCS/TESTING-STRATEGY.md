# 🧪 STRATEGIA TESTOWANIA

**Kompletny plan testowania aplikacji EduTailor.ai**

---

## 🎯 Cele testowania

1. **Zero critical bugs** w produkcji
2. **Coverage > 70%** dla core functionality
3. **Automated regression tests** przed każdym release
4. **Performance benchmarks** dla 3D rendering

---

## 📊 Piramida testów

```
          /\
         /E2E\         10% - End-to-End (Playwright)
        /------\
       /  API   \      20% - Integration tests
      /----------\
     /   Unit     \    70% - Unit tests
    /--------------\
```

---

## 🧪 Unit Tests (70%)

### **Frontend - React Components**

**Priorytet CRITICAL:**
```typescript
// TrainingCard.test.tsx
describe('TrainingCard', () => {
  it('renders training title', () => {
    render(<TrainingCard training={mockTraining} />)
    expect(screen.getByText('Test Training')).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const onClick = jest.fn()
    render(<TrainingCard training={mockTraining} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith(mockTraining)
  })
  
  it('shows favorite icon when favorite is true', () => {
    render(<TrainingCard training={{ ...mockTraining, favorite: true }} />)
    expect(screen.getByTestId('favorite-icon')).toHaveClass('active')
  })
})
```

**Lista komponentów do przetestowania:**
- [ ] TrainingCard ⭐ **CRITICAL**
- [ ] EditorComponent
- [ ] ViewerComponent
- [ ] DialogEditor
- [ ] LoginForm ⭐ **CRITICAL**
- [ ] RegisterForm
- [ ] TrainingList
- [ ] Dashboard

### **Frontend - Services**

```typescript
// training.service.test.ts
describe('TrainingService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  it('fetches all trainings', async () => {
    const mockData = [{ id: '1', title: 'Test' }]
    axios.get.mockResolvedValue({ data: mockData })
    
    const result = await TrainingService.getTrainings()
    expect(result.data).toEqual(mockData)
    expect(axios.get).toHaveBeenCalledWith('/api/Trainings', {})
  })
  
  it('handles error on fetch failure', async () => {
    axios.get.mockRejectedValue(new Error('Network error'))
    
    await expect(TrainingService.getTrainings()).rejects.toThrow('Network error')
  })
})
```

**Lista services:**
- [ ] TrainingService ⭐ **CRITICAL**
- [ ] AuthService ⭐ **CRITICAL**
- [ ] CommentService
- [ ] AnalyticsService

### **Frontend - Managers (3D)**

```typescript
// editor-manager.test.ts
describe('EditorManager', () => {
  let manager: EditorManager
  
  beforeEach(() => {
    manager = new EditorManager()
  })
  
  afterEach(() => {
    manager.reset()
  })
  
  it('initializes successfully', async () => {
    await manager.initialize()
    expect(manager.initialized.value).toBe(true)
  })
  
  it('loads training scene', async () => {
    const uuid = 'test-uuid'
    const mockScene = { id: uuid, title: 'Test Scene' }
    
    jest.spyOn(http, 'get').mockResolvedValue({ data: mockScene })
    
    const result = await manager.loadTrainingScene(uuid)
    expect(result).toEqual(mockScene)
    expect(manager.trainingSceneLoaded.value).toEqual(mockScene)
  })
})
```

**Lista managers:**
- [ ] EditorManager ⭐ **CRITICAL**
- [ ] ViewerManager ⭐ **CRITICAL**
- [ ] ScenarioEngine
- [ ] CameraManager
- [ ] AvatarManager

### **Backend - Controllers**

```csharp
// TrainingsControllerTests.cs
public class TrainingsControllerTests
{
    private readonly Mock<AppDBContext> _contextMock;
    private readonly TrainingsController _controller;
    
    public TrainingsControllerTests()
    {
        _contextMock = new Mock<AppDBContext>();
        _controller = new TrainingsController(_contextMock.Object);
    }
    
    [Fact]
    public async Task GetTrainings_ReturnsAllTrainings()
    {
        // Arrange
        var trainings = new List<Training> {
            new Training { Id = Guid.NewGuid(), Title = "Test 1" },
            new Training { Id = Guid.NewGuid(), Title = "Test 2" }
        };
        
        _contextMock.Setup(c => c.Training).ReturnsDbSet(trainings);
        
        // Act
        var result = await _controller.GetTrainings();
        
        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedTrainings = Assert.IsAssignableFrom<IEnumerable<TrainingDTO>>(okResult.Value);
        Assert.Equal(2, returnedTrainings.Count());
    }
    
    [Fact]
    public async Task GetTraining_ReturnsNotFound_WhenTrainingDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();
        _contextMock.Setup(c => c.Training.FindAsync(id)).ReturnsAsync((Training)null);
        
        // Act
        var result = await _controller.GetTraining(id);
        
        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }
    
    [Fact]
    public async Task CreateTraining_ReturnsCreatedTraining()
    {
        // Arrange
        var dto = new TrainingDTO { Title = "New Training" };
        
        // Act
        var result = await _controller.CreateTraining(dto);
        
        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var training = Assert.IsType<TrainingDTO>(createdResult.Value);
        Assert.Equal("New Training", training.Title);
    }
}
```

**Lista controllers:**
- [ ] TrainingsController ⭐ **CRITICAL**
- [ ] AuthController ⭐ **CRITICAL**
- [ ] TrainingSectionComponentController
- [ ] TrainingFavoriteController

### **Backend - Services**

```csharp
// UserServiceTests.cs
public class UserServiceTests
{
    [Fact]
    public async Task GetUserById_ReturnsUser_WhenExists()
    {
        // Arrange
        var mockUserManager = MockUserManager<User>();
        var service = new UserService(mockUserManager.Object);
        var userId = "test-user-id";
        var user = new User { Id = userId, Email = "test@example.com" };
        
        mockUserManager.Setup(m => m.FindByIdAsync(userId)).ReturnsAsync(user);
        
        // Act
        var result = await service.GetUserByIdAsync(userId);
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal(userId, result.Id);
    }
}
```

---

## 🔗 Integration Tests (20%)

### **API Integration Tests**

```csharp
// TrainingIntegrationTests.cs
public class TrainingIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    
    public TrainingIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }
    
    [Fact]
    public async Task GetTrainings_ReturnsSuccessStatusCode()
    {
        // Act
        var response = await _client.GetAsync("/api/Trainings");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var trainings = JsonSerializer.Deserialize<List<TrainingDTO>>(content);
        Assert.NotNull(trainings);
    }
    
    [Fact]
    public async Task CreateTraining_WithValidData_ReturnsCreated()
    {
        // Arrange
        var training = new TrainingDTO { Title = "Integration Test Training" };
        var json = JsonSerializer.Serialize(training);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        // Act
        var response = await _client.PostAsync("/api/Trainings", content);
        
        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
}
```

### **Database Integration Tests**

```csharp
// DatabaseTests.cs
public class DatabaseTests : IDisposable
{
    private readonly AppDBContext _context;
    
    public DatabaseTests()
    {
        var options = new DbContextOptionsBuilder<AppDBContext>()
            .UseInMemoryDatabase(databaseName: "TestDb")
            .Options;
        
        _context = new AppDBContext(options);
    }
    
    [Fact]
    public async Task CanCreateAndRetrieveTraining()
    {
        // Arrange
        var training = new Training { Title = "Test Training" };
        
        // Act
        _context.Training.Add(training);
        await _context.SaveChangesAsync();
        
        var retrieved = await _context.Training.FindAsync(training.Id);
        
        // Assert
        Assert.NotNull(retrieved);
        Assert.Equal("Test Training", retrieved.Title);
    }
    
    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
```

---

## 🌐 E2E Tests (10%)

### **Critical User Flows**

**Setup Playwright:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Test 1: Complete Training Creation Flow**
```typescript
// e2e/create-training.spec.ts
import { test, expect } from '@playwright/test'

test('Create complete training from scratch', async ({ page }) => {
  // Login
  await page.goto('/auth/login')
  await page.fill('#email', 'test@example.com')
  await page.fill('#password', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
  
  // Create training
  await page.click('text=New Training')
  await page.fill('#title', 'E2E Test Training')
  await page.fill('#description', 'Created by E2E test')
  await page.click('text=Save')
  
  // Add section
  await page.click('text=Add Section')
  await page.fill('#section-title', 'Introduction')
  await page.click('text=Save Section')
  
  // Add scene component
  await page.click('text=Add Component')
  await page.selectOption('#component-type', 'SCENE')
  await page.click('text=Edit Scene')
  
  // Wait for 3D editor to load
  await page.waitForSelector('canvas#EDITOR-canvas')
  
  // Select scene
  await page.click('text=Doctor\'s clinic')
  await expect(page.locator('.scene-loaded')).toBeVisible()
  
  // Add avatar
  await page.click('text=Add Avatar')
  await page.click('.avatar-item[data-id="652d15c12b0b061b5bce48cb"]')
  
  // Save scene
  await page.click('button[text="Save Scene"]')
  await expect(page.locator('.toast-success')).toContainText('Scene saved')
  
  // Go to dialog editor
  await page.click('text=Edit Dialog')
  await page.waitForSelector('.rete-editor')
  
  // Add nodes
  await page.rightClick('.rete-editor')
  await page.click('text=NPC')
  // ... add more nodes
  
  // Save dialog
  await page.click('button[text="Save Dialog"]')
  
  // Publish training
  await page.click('text=Publish')
  await page.click('button:has-text("Confirm")')
  await expect(page.locator('.training-status')).toContainText('Published')
})
```

**Test 2: Play Training Flow**
```typescript
test('Play through complete training', async ({ page }) => {
  await page.goto('/viewer?trainingSceneUUID=test-uuid')
  
  // Wait for scene to load
  await page.waitForSelector('canvas#VIEWER-canvas')
  await expect(page.locator('.loading-progress')).toHaveValue('100')
  
  // Start training
  await page.click('button:has-text("Start Training")')
  
  // NPC dialog appears
  await expect(page.locator('.npc-dialog')).toBeVisible()
  await expect(page.locator('.npc-dialog-text')).toContainText('Hello')
  
  // Click continue
  await page.click('button:has-text("Continue")')
  
  // Statement choices appear
  await expect(page.locator('.statement-choices')).toBeVisible()
  await page.click('.choice:nth-child(1)')
  
  // Training completes
  await expect(page.locator('.training-complete')).toBeVisible()
  await expect(page.locator('.final-score')).toContainText('Points:')
})
```

**Test 3: Authentication Flow**
```typescript
test('Login, logout, and registration flow', async ({ page }) => {
  // Test logout redirect
  await page.goto('/dashboard')
  await expect(page).toHaveURL('/auth/login')
  
  // Test registration
  await page.click('text=Register')
  await page.fill('#email', 'newuser@example.com')
  await page.fill('#password', 'SecurePass123!')
  await page.fill('#passwordConfirm', 'SecurePass123!')
  await page.check('#terms')
  await page.click('button[type="submit"]')
  await expect(page.locator('.success-message')).toBeVisible()
  
  // Test login
  await page.goto('/auth/login')
  await page.fill('#email', 'newuser@example.com')
  await page.fill('#password', 'SecurePass123!')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
  
  // Test logout
  await page.click('[data-testid="user-menu"]')
  await page.click('text=Logout')
  await expect(page).toHaveURL('/auth/login')
})
```

---

## ⚡ Performance Tests

### **Frontend Performance Benchmarks**

```typescript
// performance.test.ts
import { performance } from 'perf_hooks'

describe('Performance Benchmarks', () => {
  it('Dashboard loads in < 2s', async () => {
    const start = performance.now()
    
    render(<DashboardPage />)
    await waitFor(() => screen.getByText('Trainings'))
    
    const duration = performance.now() - start
    expect(duration).toBeLessThan(2000)
  })
  
  it('3D Editor initializes in < 3s', async () => {
    const start = performance.now()
    
    const manager = new EditorManager()
    await manager.initialize()
    
    const duration = performance.now() - start
    expect(duration).toBeLessThan(3000)
  })
})
```

### **Lighthouse CI**

```yaml
# .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:5173/'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.8 }]
      }
    }
  }
}
```

---

## 🔍 Manual Testing Checklist

### **Before each release:**

**Critical Paths:**
- [ ] User can register and login
- [ ] User can create new training
- [ ] User can add scene to training
- [ ] User can edit 3D scene (add avatars, props)
- [ ] User can create dialog scenario
- [ ] User can publish training
- [ ] User can play training in viewer
- [ ] VR mode works (if available)

**Edge Cases:**
- [ ] Handling of network errors
- [ ] Validation errors display correctly
- [ ] Token refresh works
- [ ] Large scenes load correctly
- [ ] Complex dialogs execute correctly

**Browser Compatibility:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Devices:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (iPad)
- [ ] Mobile (iPhone)
- [ ] VR Headset (Oculus Quest)

---

## 🎯 Test Coverage Goals

### **Current Status:**
- Unit Tests: **0%** ❌
- Integration Tests: **0%** ❌
- E2E Tests: **0%** ❌

### **Target (Month 1):**
- Unit Tests: **40%** 🎯
- Integration Tests: **10%** 🎯
- E2E Tests: **3 critical flows** 🎯

### **Target (Month 2):**
- Unit Tests: **70%** 🎯
- Integration Tests: **20%** 🎯
- E2E Tests: **10 user flows** 🎯

---

## 📅 Testing Schedule

### **Daily:**
- Run unit tests przed commit
- Fix failing tests

### **Weekly:**
- Run integration tests
- Update test coverage report

### **Before Release:**
- Full E2E test suite
- Manual testing checklist
- Performance benchmarks
- Cross-browser testing

---

## 🛠️ Tools Setup

### **Frontend Testing:**
```bash
cd bd-academy

# Install dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test

# Run tests
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:coverage     # Coverage report
```

### **Backend Testing:**
```bash
cd bd-academy-backend

# Install test packages
dotnet add package xUnit
dotnet add package Moq
dotnet add package Microsoft.AspNetCore.Mvc.Testing

# Run tests
dotnet test                           # All tests
dotnet test --collect:"XPlat Code Coverage"  # With coverage
```

---

**Ostatnia aktualizacja:** 2025-11-11
