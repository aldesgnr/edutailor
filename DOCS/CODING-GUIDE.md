# 💻 PRZEWODNIK KODOWANIA - EDUTAILOR.AI

## Spis treści
- [Konwencje kodowania](#konwencje-kodowania)
- [Struktura plików](#struktura-plików)
- [Wzorce projektowe](#wzorce-projektowe)
- [Jak dodać nową funkcjonalność](#jak-dodać-nową-funkcjonalność)
- [Najczęstsze zadania](#najczęstsze-zadania)
- [Debugging](#debugging)
- [Testowanie](#testowanie)

---

## Konwencje kodowania

### **TypeScript/React (Frontend)**

#### **Nazewnictwo:**
```typescript
// Komponenty: PascalCase
export const TrainingCard: FunctionComponent<TrainingCardProps> = () => {}

// Pliki komponentów: kebab-case
// training-card.component.tsx

// Interfejsy: PascalCase z sufixem Props/State/Data
interface EditorManagerProps {
  canvas: HTMLCanvasElement
}

// Typy: PascalCase
type TrainingType = 'VR' | 'SCENE' | 'QUIZ'

// Stałe: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'

// Funkcje/zmienne: camelCase
const loadTrainingScene = async (uuid: string) => {}

// Manager classes: PascalCase
export class EditorManager extends ViewerManager {}

// Private fields w klasach: _ prefix
private _debug = false
```

#### **Struktura komponentu React:**
```typescript
import { FunctionComponent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './component-name.component.css'

// Props interface
export type ComponentNameProps = {
  trainingUUID: string
  onSave?: (data: TrainingData) => void
}

// Component
export const ComponentName: FunctionComponent<ComponentNameProps> = ({ 
  trainingUUID, 
  onSave 
}) => {
  // 1. Hooks (useState, useEffect, useContext, custom hooks)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const navigate = useNavigate()
  
  // 2. Effect hooks
  useEffect(() => {
    // Initialization
    return () => {
      // Cleanup
    }
  }, [trainingUUID])
  
  // 3. Event handlers
  const handleSave = () => {
    onSave?.(data)
  }
  
  // 4. Render conditions
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  // 5. JSX
  return (
    <div className="component-name">
      {/* Content */}
    </div>
  )
}
```

#### **Manager Class Pattern:**
```typescript
import { BehaviorSubject } from 'rxjs'

export class SomeManager {
  // Public observables
  public initialized = new BehaviorSubject<boolean>(false)
  public data = new BehaviorSubject<DataType | null>(null)
  
  // Private state
  private _internalState: any
  
  // Dependencies
  constructor(
    private dependency: DependencyType
  ) {
    this.initialize()
  }
  
  // Initialization
  private async initialize() {
    // Setup logic
    this.initialized.next(true)
  }
  
  // Public API
  public async loadData(id: string) {
    const result = await this.fetchData(id)
    this.data.next(result)
    return result
  }
  
  // Private helpers
  private async fetchData(id: string) {
    // Implementation
  }
  
  // Cleanup
  public reset() {
    this.data.next(null)
    this.initialized.next(false)
  }
}
```

#### **RxJS Observable Pattern:**
```typescript
// W klasie Manager
public selectedObject = new BehaviorSubject<Entity | null>(null)

// W komponencie React
useEffect(() => {
  const subscription = manager.selectedObject.subscribe(obj => {
    setSelectedObj(obj)
  })
  
  return () => {
    subscription.unsubscribe() // Ważne: cleanup!
  }
}, [manager])
```

---

### **C# (Backend)**

#### **Nazewnictwo:**
```csharp
// Klasy: PascalCase
public class TrainingService {}

// Interfejsy: I + PascalCase
public interface ITrainingService {}

// Metody: PascalCase
public async Task<Training> GetTrainingAsync(Guid id) {}

// Parametry/zmienne lokalne: camelCase
public void UpdateTraining(string trainingId, TrainingDTO dto) {
  var training = await _repository.FindAsync(trainingId);
}

// Private fields: _camelCase
private readonly AppDBContext _context;

// Stałe: PascalCase lub UPPER_SNAKE_CASE
public const string DRAFT_TYPE = "DRAFT";
```

#### **Controller Pattern:**
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace bd_academy_backend.Modules.Training.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Wymaga autentykacji
    public class TrainingsController : ControllerBase
    {
        private readonly AppDBContext _context;
        
        public TrainingsController(AppDBContext context)
        {
            _context = context;
        }
        
        // GET: api/Trainings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TrainingDTO>>> GetTrainings()
        {
            try 
            {
                var trainings = await _context.Training
                    .Include(t => t.TrainingSections) // Eager loading
                    .Where(t => t.DeletedAt == null)  // Soft delete filter
                    .ToListAsync();
                
                return Ok(trainings.Select(t => t.toDTO()));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
        
        // GET: api/Trainings/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<TrainingDTO>> GetTraining(Guid id)
        {
            var training = await _context.Training
                .Include(t => t.TrainingSections)
                    .ThenInclude(s => s.TrainingSectionComponents)
                .FirstOrDefaultAsync(t => t.Id == id && t.DeletedAt == null);
            
            if (training == null)
            {
                return NotFound();
            }
            
            return Ok(training.toDTO());
        }
        
        // POST: api/Trainings
        [HttpPost]
        public async Task<ActionResult<TrainingDTO>> CreateTraining(TrainingDTO dto)
        {
            var training = new Training().fromDTO(dto);
            training.CreatedAt = DateTime.Now;
            
            _context.Training.Add(training);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetTraining), new { id = training.Id }, training.toDTO());
        }
        
        // PUT: api/Trainings/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTraining(Guid id, TrainingDTO dto)
        {
            var training = await _context.Training.FindAsync(id);
            
            if (training == null)
            {
                return NotFound();
            }
            
            training.fromDTO(dto);
            training.UpdatedAt = DateTime.Now;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // DELETE: api/Trainings/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTraining(Guid id)
        {
            var training = await _context.Training.FindAsync(id);
            
            if (training == null)
            {
                return NotFound();
            }
            
            // Soft delete
            training.DeletedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
}
```

#### **Entity Model Pattern:**
```csharp
using Microsoft.EntityFrameworkCore;

namespace bd_academy_backend.Modules.Training.Models
{
    [PrimaryKey(nameof(Id))]
    public class Training
    {
        // Primary Key
        public Guid Id { get; set; } = Guid.NewGuid();
        
        // Properties
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; } // Soft delete
        
        // Navigation properties (1:N)
        [InverseProperty("Training")]
        public List<TrainingSection> TrainingSections { get; set; } = new List<TrainingSection>();
        
        // DTO conversion
        public TrainingDTO toDTO()
        {
            return new TrainingDTO
            {
                Id = this.Id,
                Title = this.Title,
                Description = this.Description,
                TrainingSections = this.TrainingSections.Select(s => s.toDTO()).ToList()
            };
        }
        
        public Training fromDTO(TrainingDTO dto)
        {
            this.Id = dto.Id;
            this.Title = dto.Title;
            this.Description = dto.Description;
            return this;
        }
    }
}
```

---

## Wzorce projektowe

### **1. Manager Pattern (Singleton)**

**Cel:** Centralne zarządzanie funkcjonalnością (camera, scene, assets)

**Implementacja:**
```typescript
// Context provider (singleton)
const defEditorManager = new EditorManager()

const EditorContext = createContext<EditorContextState>({
  editorManager: defEditorManager
})

// Użycie w komponencie
const { editorManager } = useContext(EditorContext)
```

### **2. Observer Pattern (RxJS)**

**Cel:** Reaktywna komunikacja między komponentami

**Implementacja:**
```typescript
// Publisher
class EditorManager {
  public selectedObject = new BehaviorSubject<Entity | null>(null)
  
  selectObject(entity: Entity) {
    this.selectedObject.next(entity)
  }
}

// Subscriber
useEffect(() => {
  const sub = editorManager.selectedObject.subscribe(obj => {
    console.log('Object selected:', obj)
  })
  return () => sub.unsubscribe()
}, [])
```

### **3. Factory Pattern**

**Cel:** Tworzenie węzłów scenariusza

**Implementacja:**
```typescript
class NodeFactory {
  static createNode(type: NodeTypes): BaseNode {
    switch(type) {
      case 'Start':
        return new StartNode(undefined, scenarioEngine)
      case 'NPC':
        return new NPCNode(undefined, scenarioEngine)
      case 'Statement':
        return new StatementNode(undefined, scenarioEngine)
      default:
        throw new Error(`Unknown node type: ${type}`)
    }
  }
}
```

### **4. DTO Pattern**

**Cel:** Separacja modelu bazodanowego od API

**Implementacja:**
```csharp
// Entity (database)
public class Training {
  public Guid Id { get; set; }
  public List<TrainingSection> TrainingSections { get; set; }
}

// DTO (API)
public class TrainingDTO {
  public Guid Id { get; set; }
  public List<TrainingSectionDTO> TrainingSections { get; set; }
}

// Conversion
public TrainingDTO toDTO() { /* ... */ }
public Training fromDTO(TrainingDTO dto) { /* ... */ }
```

### **5. Repository Pattern**

**Cel:** Abstrakcja dostępu do danych

**Implementacja:**
```csharp
public interface ITrainingRepository {
  Task<Training> GetByIdAsync(Guid id);
  Task<IEnumerable<Training>> GetAllAsync();
  Task<Training> CreateAsync(Training training);
  Task UpdateAsync(Training training);
  Task DeleteAsync(Guid id);
}

public class TrainingRepository : ITrainingRepository {
  private readonly AppDBContext _context;
  
  public TrainingRepository(AppDBContext context) {
    _context = context;
  }
  
  public async Task<Training> GetByIdAsync(Guid id) {
    return await _context.Training
      .Include(t => t.TrainingSections)
      .FirstOrDefaultAsync(t => t.Id == id);
  }
  // ...
}
```

---

## Jak dodać nową funkcjonalność

### **Przykład: Dodanie systemu komentarzy do treningów**

#### **1. Backend (Database & API)**

**Krok 1: Model Entity**
```csharp
// bd-academy-backend/Modules/Training/Models/TrainingComment.cs
[PrimaryKey(nameof(Id))]
public class TrainingComment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TrainingId { get; set; }
    public string UserId { get; set; }
    public string Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    [ForeignKey("TrainingId")]
    public Training Training { get; set; }
    
    [ForeignKey("UserId")]
    public User User { get; set; }
}
```

**Krok 2: DTO**
```csharp
// bd-academy-backend/Modules/Training/DTOs/TrainingCommentDTO.cs
public class TrainingCommentDTO
{
    public Guid Id { get; set; }
    public Guid TrainingId { get; set; }
    public string UserId { get; set; }
    public string UserName { get; set; }
    public string Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**Krok 3: Dodaj do DbContext**
```csharp
// AppDBContext.cs
public DbSet<TrainingComment> TrainingComment { get; set; } = null!;
```

**Krok 4: Migration**
```bash
cd bd-academy-backend/bd-academy-backend
dotnet ef migrations add AddTrainingComments
dotnet ef database update
```

**Krok 5: Controller**
```csharp
// bd-academy-backend/Modules/Training/Controllers/TrainingCommentsController.cs
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TrainingCommentsController : ControllerBase
{
    private readonly AppDBContext _context;
    
    public TrainingCommentsController(AppDBContext context)
    {
        _context = context;
    }
    
    [HttpGet("training/{trainingId}")]
    public async Task<ActionResult<IEnumerable<TrainingCommentDTO>>> GetComments(Guid trainingId)
    {
        var comments = await _context.TrainingComment
            .Where(c => c.TrainingId == trainingId)
            .Include(c => c.User)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
        
        return Ok(comments.Select(c => new TrainingCommentDTO {
            Id = c.Id,
            TrainingId = c.TrainingId,
            UserId = c.UserId,
            UserName = c.User.UserName,
            Comment = c.Comment,
            CreatedAt = c.CreatedAt
        }));
    }
    
    [HttpPost]
    public async Task<ActionResult<TrainingCommentDTO>> AddComment(TrainingCommentDTO dto)
    {
        var comment = new TrainingComment {
            TrainingId = dto.TrainingId,
            UserId = dto.UserId,
            Comment = dto.Comment
        };
        
        _context.TrainingComment.Add(comment);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetComments), new { trainingId = comment.TrainingId }, dto);
    }
}
```

**Krok 6: Regeneruj API Client**
```powershell
cd bd-academy-backend
./generate-api-clients.ps1
```

#### **2. Frontend (UI & State)**

**Krok 1: Service**
```typescript
// bd-academy/src/services/comment.service.ts
import { http } from '../interceptors/axios'

export interface CommentData {
  id: string
  trainingId: string
  userId: string
  userName: string
  comment: string
  createdAt: Date
}

export class CommentService {
  static getComments(trainingId: string) {
    return http.get<CommentData[]>(`/api/TrainingComments/training/${trainingId}`)
  }
  
  static addComment(data: { trainingId: string; userId: string; comment: string }) {
    return http.post<CommentData>('/api/TrainingComments', data)
  }
}
```

**Krok 2: Component**
```typescript
// bd-academy/src/components/training/training-comments.component.tsx
import { FunctionComponent, useEffect, useState } from 'react'
import { CommentService, CommentData } from '../../services/comment.service'
import './training-comments.component.css'

export type TrainingCommentsProps = {
  trainingId: string
}

export const TrainingComments: FunctionComponent<TrainingCommentsProps> = ({ trainingId }) => {
  const [comments, setComments] = useState<CommentData[]>([])
  const [newComment, setNewComment] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  useEffect(() => {
    loadComments()
  }, [trainingId])
  
  const loadComments = async () => {
    setIsLoading(true)
    try {
      const response = await CommentService.getComments(trainingId)
      setComments(response.data)
    } catch (error) {
      console.error('Failed to load comments', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSubmit = async () => {
    if (!newComment.trim()) return
    
    try {
      await CommentService.addComment({
        trainingId,
        userId: 'current-user-id', // Get from auth context
        comment: newComment
      })
      setNewComment('')
      loadComments()
    } catch (error) {
      console.error('Failed to add comment', error)
    }
  }
  
  return (
    <div className="training-comments">
      <h3>Comments</h3>
      
      <div className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button onClick={handleSubmit}>Submit</button>
      </div>
      
      <div className="comments-list">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-author">{comment.userName}</div>
              <div className="comment-text">{comment.comment}</div>
              <div className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

**Krok 3: Dodaj do strony**
```typescript
// bd-academy/src/pages/training/training-detail.page.tsx
import { TrainingComments } from '../../components/training/training-comments.component'

export const TrainingDetailPage = () => {
  const [trainingId, setTrainingId] = useState<string>('')
  
  return (
    <div>
      {/* Existing content */}
      
      <TrainingComments trainingId={trainingId} />
    </div>
  )
}
```

---

## Najczęstsze zadania

### **1. Dodanie nowej strony**

```typescript
// 1. Stwórz komponent strony
// bd-academy/src/pages/my-page/my-page.page.tsx
export const MyPage: FunctionComponent = () => {
  return <div>My Page</div>
}

// 2. Dodaj routing
// bd-academy/src/router/router.tsx
<Route path="/my-page" element={<MyPage />} />
```

### **2. Dodanie nowego endpoint API**

```csharp
// 1. Controller
[HttpGet("custom-endpoint")]
public async Task<ActionResult> CustomEndpoint() {
  // Implementation
  return Ok(result);
}

// 2. Regeneruj API client
// cd bd-academy-backend
// ./generate-api-clients.ps1
```

### **3. Modyfikacja bazy danych**

```csharp
// 1. Zmień model Entity
public class Training {
  public string NewField { get; set; } // Dodane pole
}

// 2. Stwórz migrację
// dotnet ef migrations add AddNewFieldToTraining

// 3. Zastosuj
// dotnet ef database update
```

### **4. Dodanie nowego typu węzła w ScenarioEngine**

```typescript
// 1. Stwórz klasę węzła
// bd-academy/src/lib/scenarion-engine/nodes/CustomNode.tsx
export class CustomNode extends BaseNode {
  constructor(config: NodeDef | undefined, engine: ScenarioEngine) {
    super('Custom', config, engine)
    // Configuration
  }
}

// 2. Dodaj do factory
// bd-academy/src/lib/scenarion-engine/scenarion-engine.ts
items: ContextMenuPresets.classic.setup([
  ['Custom', () => new CustomNode(undefined, this)]
])
```

### **5. Dodanie nowego managera 3D**

```typescript
// 1. Stwórz klasę
export class MyManager {
  public initialized = new BehaviorSubject<boolean>(false)
  
  constructor(private app: Application) {
    this.initialize()
  }
  
  private initialize() {
    // Setup
    this.initialized.next(true)
  }
  
  public reset() {
    this.initialized.next(false)
  }
}

// 2. Dodaj do ViewerManager/EditorManager
protected myManager: MyManager

constructor() {
  this.myManager = new MyManager(this.app)
}
```

---

## Debugging

### **Frontend (Chrome DevTools)**

```typescript
// 1. Console logging
console.log('Value:', value)
console.table(array)
console.trace() // Stack trace

// 2. Breakpoints
debugger; // Code breakpoint

// 3. React DevTools
// Install extension: React Developer Tools

// 4. PlayCanvas Inspector
if (this.debug) {
  console.log('Camera position:', this.camera.getPosition())
  console.log('Entity count:', this.app.root.children.length)
}

// 5. RxJS debugging
manager.selectedObject.subscribe(obj => {
  console.log('Selected object changed:', obj)
})
```

### **Backend (.NET)**

```csharp
// 1. Logging
_logger.LogInformation("Training loaded: {Id}", training.Id);
_logger.LogError(ex, "Failed to load training");

// 2. Breakpoints w Visual Studio
// F9 - toggle breakpoint
// F5 - start debugging
// F10 - step over
// F11 - step into

// 3. Watch window
// Dodaj zmienne do obserwacji

// 4. EF Core query logging
optionsBuilder.LogTo(Console.WriteLine);
```

### **Network debugging**

```javascript
// Axios interceptor
http.interceptors.request.use(config => {
  console.log('Request:', config.method, config.url, config.data)
  return config
})

http.interceptors.response.use(
  response => {
    console.log('Response:', response.status, response.data)
    return response
  },
  error => {
    console.error('Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)
```

---

## Testowanie

### **Frontend (vitest/jest)**

```typescript
// Component test
import { render, screen } from '@testing-library/react'
import { TrainingCard } from './training-card.component'

describe('TrainingCard', () => {
  it('renders training title', () => {
    const training = { id: '1', title: 'Test Training' }
    render(<TrainingCard training={training} />)
    expect(screen.getByText('Test Training')).toBeInTheDocument()
  })
})

// Service test
import { TrainingService } from './training.service'

describe('TrainingService', () => {
  it('fetches trainings', async () => {
    const trainings = await TrainingService.getTrainings()
    expect(trainings.data).toBeDefined()
  })
})
```

### **Backend (xUnit)**

```csharp
public class TrainingsControllerTests
{
    [Fact]
    public async Task GetTraining_ReturnsTraining_WhenExists()
    {
        // Arrange
        var context = CreateContext();
        var controller = new TrainingsController(context);
        var trainingId = Guid.NewGuid();
        
        // Act
        var result = await controller.GetTraining(trainingId);
        
        // Assert
        Assert.IsType<OkObjectResult>(result.Result);
    }
}
```

---

## Best Practices

### **Do's ✅**

1. **Zawsze cleanup subscriptions w useEffect**
```typescript
useEffect(() => {
  const sub = observable.subscribe(...)
  return () => sub.unsubscribe()
}, [])
```

2. **Używaj TypeScript typów**
```typescript
// ❌ Bad
const data: any = response.data

// ✅ Good
const data: TrainingData = response.data
```

3. **Async/await z try-catch**
```typescript
try {
  const response = await api.getData()
  setData(response.data)
} catch (error) {
  console.error(error)
  showError('Failed to load data')
}
```

4. **Eager loading w EF Core**
```csharp
// ❌ Bad (N+1 query)
var trainings = await _context.Training.ToListAsync();
foreach(var t in trainings) {
  var sections = t.TrainingSections; // Lazy load
}

// ✅ Good
var trainings = await _context.Training
  .Include(t => t.TrainingSections)
  .ToListAsync();
```

### **Don'ts ❌**

1. **Nie mutuj state bezpośrednio**
```typescript
// ❌ Bad
state.value = newValue

// ✅ Good
setState({ ...state, value: newValue })
```

2. **Nie zapomnij o dependency array**
```typescript
// ❌ Bad (infinite loop)
useEffect(() => {
  fetchData()
})

// ✅ Good
useEffect(() => {
  fetchData()
}, [dependency])
```

3. **Nie zwracaj hasła w DTO**
```csharp
// ❌ Bad
public class UserDTO {
  public string PasswordHash { get; set; }
}

// ✅ Good
public class UserDTO {
  // No password fields
}
```

---

**Ostatnia aktualizacja:** 2025-11-11
