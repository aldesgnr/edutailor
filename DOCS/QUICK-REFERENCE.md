# ⚡ QUICK REFERENCE - Snippety i Skróty

## 🚀 Szybki start

### Uruchomienie projektu
```bash
# Frontend
cd bd-academy
npm install
npm run dev

# Backend
cd bd-academy-backend/bd-academy-backend
dotnet run

# Static server
cd bd-academy-static
npm install
npm start
```

---

## 🔥 Najczęściej używane snippety

### **React Component**
```typescript
import { FunctionComponent, useState, useEffect } from 'react'

export type ComponentNameProps = {
  id: string
  onSave?: (data: any) => void
}

export const ComponentName: FunctionComponent<ComponentNameProps> = ({ id, onSave }) => {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  useEffect(() => {
    loadData()
  }, [id])
  
  const loadData = async () => {
    setIsLoading(true)
    try {
      const response = await api.getData(id)
      setData(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSave = () => {
    onSave?.(data)
  }
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div className="component-name">
      <button onClick={handleSave}>Save</button>
    </div>
  )
}
```

### **Manager Class**
```typescript
import { BehaviorSubject } from 'rxjs'
import { Application } from 'playcanvas'

export class MyManager {
  public initialized = new BehaviorSubject<boolean>(false)
  public data = new BehaviorSubject<DataType | null>(null)
  
  constructor(private app: Application) {
    this.initialize()
  }
  
  private async initialize() {
    // Setup
    this.initialized.next(true)
  }
  
  public async loadData(id: string) {
    const result = await this.fetchData(id)
    this.data.next(result)
  }
  
  public reset() {
    this.data.next(null)
    this.initialized.next(false)
  }
}
```

### **API Service**
```typescript
import { http } from '../interceptors/axios'

export interface DataModel {
  id: string
  name: string
}

export class DataService {
  static getAll() {
    return http.get<DataModel[]>('/api/data')
  }
  
  static getById(id: string) {
    return http.get<DataModel>(`/api/data/${id}`)
  }
  
  static create(data: DataModel) {
    return http.post<DataModel>('/api/data', data)
  }
  
  static update(id: string, data: DataModel) {
    return http.put<DataModel>(`/api/data/${id}`, data)
  }
  
  static delete(id: string) {
    return http.delete(`/api/data/${id}`)
  }
}
```

### **Controller (C#)**
```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class MyController : ControllerBase
{
    private readonly AppDBContext _context;
    
    public MyController(AppDBContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MyEntityDTO>>> GetAll()
    {
        var entities = await _context.MyEntity
            .Include(e => e.RelatedEntity)
            .Where(e => e.DeletedAt == null)
            .ToListAsync();
        
        return Ok(entities.Select(e => e.toDTO()));
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<MyEntityDTO>> GetById(Guid id)
    {
        var entity = await _context.MyEntity.FindAsync(id);
        
        if (entity == null) return NotFound();
        
        return Ok(entity.toDTO());
    }
    
    [HttpPost]
    public async Task<ActionResult<MyEntityDTO>> Create(MyEntityDTO dto)
    {
        var entity = new MyEntity().fromDTO(dto);
        entity.CreatedAt = DateTime.Now;
        
        _context.MyEntity.Add(entity);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity.toDTO());
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, MyEntityDTO dto)
    {
        var entity = await _context.MyEntity.FindAsync(id);
        
        if (entity == null) return NotFound();
        
        entity.fromDTO(dto);
        entity.UpdatedAt = DateTime.Now;
        
        await _context.SaveChangesAsync();
        
        return NoContent();
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _context.MyEntity.FindAsync(id);
        
        if (entity == null) return NotFound();
        
        entity.DeletedAt = DateTime.Now; // Soft delete
        await _context.SaveChangesAsync();
        
        return NoContent();
    }
}
```

### **Entity Model**
```csharp
[PrimaryKey(nameof(Id))]
public class MyEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
    
    // Foreign Key
    public Guid RelatedEntityId { get; set; }
    
    [ForeignKey("RelatedEntityId")]
    public RelatedEntity RelatedEntity { get; set; }
    
    // Navigation property (1:N)
    [InverseProperty("MyEntity")]
    public List<ChildEntity> Children { get; set; } = new();
    
    // DTO conversion
    public MyEntityDTO toDTO()
    {
        return new MyEntityDTO
        {
            Id = this.Id,
            Name = this.Name,
            Children = this.Children.Select(c => c.toDTO()).ToList()
        };
    }
    
    public MyEntity fromDTO(MyEntityDTO dto)
    {
        this.Id = dto.Id;
        this.Name = dto.Name;
        return this;
    }
}
```

---

## 🎯 PlayCanvas Snippets

### **Create Entity**
```typescript
const entity = new Entity('MyEntity')
entity.setPosition(0, 1, 0)
entity.setEulerAngles(0, 90, 0)
entity.setLocalScale(1, 1, 1)

app.root.addChild(entity)
```

### **Load GLB Model**
```typescript
const loadModel = async (url: string): Promise<Entity> => {
  const asset = await new Promise<Asset>((resolve, reject) => {
    app.assets.loadFromUrl(url, 'container', (err, asset) => {
      if (err) reject(err)
      else resolve(asset as Asset)
    })
  })
  
  const entity = asset.resource.instantiateRenderEntity()
  app.root.addChild(entity)
  
  return entity
}
```

### **Camera Setup**
```typescript
const camera = new Entity('Camera')
camera.addComponent('camera', {
  clearColor: new Color(0.1, 0.1, 0.1),
  farClip: 1000,
  nearClip: 0.1,
  fov: 60
})

camera.setPosition(0, 2, 5)
camera.lookAt(0, 0, 0)

app.root.addChild(camera)
```

### **Light Setup**
```typescript
const light = new Entity('DirectionalLight')
light.addComponent('light', {
  type: 'directional',
  color: new Color(1, 1, 1),
  intensity: 1,
  castShadows: true
})

light.setEulerAngles(45, 30, 0)
app.root.addChild(light)
```

### **Find Entity**
```typescript
// By name
const entity = app.root.findByName('EntityName')

// By path
const entity = app.root.findByPath('Parent/Child/Entity')

// Traverse all
const traverse = (entity: Entity, callback: (e: Entity) => void) => {
  callback(entity)
  entity.children.forEach(child => traverse(child, callback))
}

traverse(app.root, (e) => {
  if (e.name === 'Target') {
    console.log('Found:', e)
  }
})
```

### **Animation**
```typescript
// Load animation
const animAsset = await loadAsset(animUrl, 'animation')

// Add to entity
entity.addComponent('anim', {
  activate: true
})

entity.anim.assignAnimation('idle', animAsset)
entity.anim.play('idle', 0.2) // 0.2s blend time
```

### **Collision**
```typescript
entity.addComponent('collision', {
  type: 'box',
  halfExtents: new Vec3(0.5, 0.5, 0.5)
})

entity.addComponent('rigidbody', {
  type: 'static', // or 'dynamic', 'kinematic'
  mass: 1
})
```

---

## 🔧 Utility Functions

### **UUID Generator**
```typescript
export const uuidv4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
```

### **Deep Clone**
```typescript
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}
```

### **Debounce**
```typescript
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Usage
const handleSearch = debounce((query: string) => {
  console.log('Searching:', query)
}, 300)
```

### **Format Date**
```typescript
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
```

### **Local Storage**
```typescript
export const storage = {
  get: <T>(key: string): T | null => {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  },
  
  set: <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value))
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(key)
  },
  
  clear: (): void => {
    localStorage.clear()
  }
}
```

---

## 📡 API Interceptors

### **Axios Setup**
```typescript
import axios from 'axios'
import { appConfig } from '../app.config'

export const http = axios.create({
  baseURL: appConfig().API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor (add JWT)
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor (handle errors)
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post(`${appConfig().API_URL}/auth/refresh`, {
          refreshToken
        })
        
        localStorage.setItem('accessToken', response.data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`
        
        return http(originalRequest)
      } catch (refreshError) {
        // Refresh failed - logout
        localStorage.clear()
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)
```

---

## 🎨 CSS/TailwindCSS

### **Common Patterns**
```css
/* Flexbox centering */
.center {
  @apply flex items-center justify-center;
}

/* Card */
.card {
  @apply bg-dark-800 rounded-2xl p-4 shadow-lg;
}

/* Button */
.btn {
  @apply px-4 py-2 rounded-lg font-semibold transition-colors;
}

.btn-primary {
  @apply bg-primary text-white hover:bg-primary-dark;
}

/* Input */
.input {
  @apply border border-gray-300 rounded-lg px-3 py-2 
         focus:outline-none focus:border-primary;
}

/* Grid layout */
.grid-cards {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}
```

---

## 🔍 Debugging

### **Console Tricks**
```typescript
// Table view
console.table(arrayOfObjects)

// Group
console.group('API Calls')
console.log('Request:', data)
console.log('Response:', response)
console.groupEnd()

// Time measurement
console.time('loadData')
await loadData()
console.timeEnd('loadData')

// Trace
console.trace('Execution path')
```

### **React DevTools**
```typescript
// Add display name for better debugging
ComponentName.displayName = 'ComponentName'

// Debug re-renders
useEffect(() => {
  console.log('Component rendered', { props, state })
})
```

### **PlayCanvas Debug**
```typescript
// Show bounding boxes
entity.render.renderOutline = true

// Log entity hierarchy
const logHierarchy = (entity: Entity, depth = 0) => {
  console.log('  '.repeat(depth) + entity.name)
  entity.children.forEach(child => logHierarchy(child, depth + 1))
}
logHierarchy(app.root)

// FPS counter
app.on('update', (dt) => {
  const fps = Math.round(1 / dt)
  console.log('FPS:', fps)
})
```

---

## 📦 Database Queries (EF Core)

### **Common Patterns**
```csharp
// Simple query
var items = await _context.Items.ToListAsync();

// With filter
var items = await _context.Items
  .Where(i => i.Active && i.DeletedAt == null)
  .ToListAsync();

// Include related (eager loading)
var items = await _context.Items
  .Include(i => i.RelatedItems)
    .ThenInclude(r => r.SubItems)
  .ToListAsync();

// Pagination
var items = await _context.Items
  .Skip((page - 1) * pageSize)
  .Take(pageSize)
  .ToListAsync();

// Sorting
var items = await _context.Items
  .OrderBy(i => i.CreatedAt)
  .ThenByDescending(i => i.Priority)
  .ToListAsync();

// Count
var count = await _context.Items.CountAsync();

// Any/All
var exists = await _context.Items.AnyAsync(i => i.Name == "Test");
var allActive = await _context.Items.AllAsync(i => i.Active);

// Single/First
var item = await _context.Items.SingleOrDefaultAsync(i => i.Id == id);
var first = await _context.Items.FirstOrDefaultAsync();

// Aggregation
var total = await _context.Orders.SumAsync(o => o.Total);
var average = await _context.Orders.AverageAsync(o => o.Total);
var max = await _context.Orders.MaxAsync(o => o.Total);
```

---

## 🚨 Error Handling

### **Frontend**
```typescript
try {
  const response = await api.getData()
  setData(response.data)
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server error (4xx, 5xx)
      console.error('Server error:', error.response.status, error.response.data)
      showToast('Error', error.response.data.message, 'error')
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request)
      showToast('Error', 'Network error', 'error')
    } else {
      // Other error
      console.error('Error:', error.message)
    }
  }
} finally {
  setIsLoading(false)
}
```

### **Backend**
```csharp
try
{
    var item = await _context.Items.FindAsync(id);
    
    if (item == null)
        return NotFound(new { message = "Item not found" });
    
    return Ok(item);
}
catch (DbUpdateException ex)
{
    _logger.LogError(ex, "Database update failed");
    return StatusCode(500, new { message = "Database error" });
}
catch (Exception ex)
{
    _logger.LogError(ex, "Unexpected error");
    return StatusCode(500, new { message = "Internal server error" });
}
```

---

**Ostatnia aktualizacja:** 2025-11-11
