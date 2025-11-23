# 🔧 SZCZEGÓŁY IMPLEMENTACYJNE

## Dogłębna analiza kluczowych mechanizmów

---

## 📊 Table of Contents
- [Managers System](#managers-system)
- [ScenarioEngine Deep Dive](#scenarioengine-deep-dive)
- [3D Scene Loading Pipeline](#3d-scene-loading-pipeline)
- [Authentication Flow](#authentication-flow)
- [Data Synchronization](#data-synchronization)
- [Performance Optimization](#performance-optimization)

---

## Managers System

### Hierarchia i wzajemne zależności

```
ViewerManager (Base Class)
├── Initialization
│   ├── PlayCanvas Application setup
│   ├── Canvas creation & DOM attachment
│   ├── Graphics device configuration
│   └── Event listeners setup
│
├── Managers (composition)
│   ├── AssetsManager
│   ├── AnimationManager
│   ├── AmmoManager (Physics)
│   ├── CameraManager
│   ├── SceneManager
│   ├── AvatarManager
│   ├── ScriptManager
│   ├── ScenarioEngine
│   └── WebXrManager
│
└── Lifecycle
    ├── initialize()
    ├── loadTrainingScene()
    ├── startTraining()
    └── reset()

EditorManager (extends ViewerManager)
├── Additional features
│   ├── TransformControls
│   ├── ObjectSelector
│   ├── Collision detection
│   └── Scene export/import
│
└── Editor-specific state
    ├── selectedAvatar
    ├── selectedAsset
    ├── editableScene
    └── possibleScenes
```

### Inicjalizacja ViewerManager (krok po kroku)

```typescript
// 1. Constructor - podstawowa konfiguracja
constructor(type: ManagerType = ManagerType.VIEWER) {
  this.managerType = type
  this.canvas = document.createElement('canvas')
  this.canvas.id = `${this.managerType}-canvas`
  
  // 2. PlayCanvas Application setup
  this.app = new Application(this.canvas, {
    mouse: new Mouse(this.canvas),
    touch: new TouchDevice(this.canvas),
    keyboard: new Keyboard(window),
    graphicsDeviceOptions: {
      xrCompatible: true,        // VR support
      antialias: true,           // Smooth edges
      alpha: false,              // Opaque background
      preserveDrawingBuffer: false,
      preferWebGl2: true
    }
  })
  
  // 3. App configuration
  this.app.setCanvasFillMode(FILLMODE_FILL_WINDOW)
  this.app.setCanvasResolution(RESOLUTION_AUTO)
  this.app.scene.gammaCorrection = GAMMA_SRGB
  this.app.scene.toneMapping = TONEMAP_ACES
  
  // 4. Create managers
  this.assetsManager = new AssetsManager(this.app)
  this.animationManager = new AnimationManager(this.app)
  this.ammoManager = new AmmoManager(this.app)
  this.cameraManager = new CameraManager(this.app)
  this.sceneManager = new SceneManager(this.app)
  this.avatarManager = new AvatarManager(this.app)
  this.scriptManager = new ScriptManager(this.app)
  this.scenarioEngine = new ScenarioEngine(this.app, sceneMiddleware)
  this.webXrManager = new WebXrManager(this.app)
  
  // 5. Setup render loop
  this.app.on('update', (dt) => {
    if (!this._enableRender) return
    this.updates.forEach(fn => fn(dt))
  })
  
  // 6. Physics initialization
  this.ammoManager.initialized.subscribe(initialized => {
    if (initialized) {
      this.physicsInitialized.next(true)
    }
  })
  
  // 7. Call post-initialization hook
  this.managerPostInitialize()
  
  // 8. Mark as initialized
  this.initialized.next(true)
}
```

### EditorManager dodatkowa logika

```typescript
protected managerPostInitialize() {
  // 1. Load editor configuration
  this.loadEditorConfiguration()
    .then((configuration) => {
      // 2. Store available scenes
      this.possibleScenes.next(configuration.data.scenes)
      
      // 3. Process avatars (add STATIC_URL prefix)
      configuration.data.avatars.forEach(avatar => {
        if (avatar.model?.includes('static') && !avatar.model?.includes('http')) {
          avatar.model = appConfig().STATIC_URL + avatar.model
          avatar.image = appConfig().STATIC_URL + avatar.image
        }
      })
      this.predefinedAvatars.next(configuration.data.avatars)
      
      // 4. Store assets and animations
      this.predefinedAssets.next(configuration.data.assets)
      this.animationManager.animationsDef = configuration.data.animations
      
      // 5. Setup object selector
      this.scriptManager.objectSelector?.hoveredObject.subscribe(() => {
        // Handle hover
      })
      
      this.scriptManager.objectSelector?.selectedObject.subscribe((selected) => {
        if (selected) {
          this._selectedObjectOutlineHelper?.setSelectedObject(selected)
        }
      })
      
      // 6. Setup collision detection
      this._objectCollision = new ObjectCollision(this.app)
    })
}
```

---

## ScenarioEngine Deep Dive

### Architektura Rete.js

```
NodeEditor
├── Nodes (graph vertices)
│   ├── StartNode
│   ├── NPCNode
│   ├── StatementNode
│   ├── HintNode
│   ├── SummaryPointsNode
│   └── EndNode
│
├── Connections (graph edges)
│   ├── input → output connections
│   └── control flow direction
│
└── Execution Engines
    ├── ControlFlowEngine (sequential execution)
    └── DataflowEngine (reactive data flow)
```

### Node Base Class

```typescript
export class BaseNode extends ClassicPreset.Node {
  constructor(
    public label: string,
    public config: NodeDef | undefined,
    public engine: ScenarioEngine
  ) {
    super(label)
    
    // Setup input/output sockets
    this.addInput('input', new ClassicPreset.Input(socket, 'Input'))
    this.addOutput('output', new ClassicPreset.Output(socket, 'Output'))
    
    // Add controls (UI elements in node)
    this.addControl('title', new LabeledInputControl('Title', ''))
  }
  
  // Execution method (called by ControlFlowEngine)
  async data(): Promise<{ output: Connection[] }> {
    // Get outgoing connections
    const connections = this.getConnections('output')
    return { output: connections }
  }
}
```

### NPCNode Implementation

```typescript
export class NPCNode extends BaseDialogNode {
  constructor(config: NodeDef | undefined, engine: ScenarioEngine) {
    super('NPC', config, engine)
    
    // Add NPC-specific controls
    this.addControl('npcText', new LabeledTextareaControl('Text', ''))
    this.addControl('avatarSelect', new SelectControl('Avatar', avatarOptions))
    this.addControl('animationSelect', new SelectControl('Animation', animOptions))
  }
  
  async data(): Promise<{ output: Connection[] }> {
    // 1. Get control values
    const text = this.controls.get('npcText').value
    const avatarId = this.controls.get('avatarSelect').value
    const animation = this.controls.get('animationSelect').value
    
    // 2. Display dialog in 3D scene
    await this.engine.textDialogMiddelware.showNPCDialog({
      text,
      avatarId,
      animation,
      position: new Vec3(0, 2, 0) // Above avatar
    })
    
    // 3. Wait for user to click "Continue"
    await new Promise(resolve => {
      this.engine.textDialogMiddelware.onContinue = resolve
    })
    
    // 4. Hide dialog
    this.engine.textDialogMiddelware.hideDialog()
    
    // 5. Return next connections
    return { output: this.getConnections('output') }
  }
}
```

### StatementNode (Player Choice)

```typescript
export class StatementNode extends BaseDialogNode {
  constructor(config: NodeDef | undefined, engine: ScenarioEngine) {
    super('Statement', config, engine)
    
    // Multiple outputs for choices
    this.addOutput('choice1', new ClassicPreset.Output(socket, 'Choice 1'))
    this.addOutput('choice2', new ClassicPreset.Output(socket, 'Choice 2'))
    this.addOutput('choice3', new ClassicPreset.Output(socket, 'Choice 3'))
    
    // Controls for each choice
    this.addControl('choice1Text', new LabeledInputControl('Choice 1', ''))
    this.addControl('choice1Points', new LabeledInputControl('Points', '0'))
    // ... repeat for choice2, choice3
  }
  
  async data(): Promise<{ [key: string]: Connection[] }> {
    // 1. Get all choices
    const choices = [
      {
        text: this.controls.get('choice1Text').value,
        points: parseInt(this.controls.get('choice1Points').value),
        output: 'choice1'
      },
      // ... choice2, choice3
    ].filter(c => c.text !== '') // Only non-empty
    
    // 2. Display choice UI
    const selectedIndex = await this.engine.textDialogMiddelware.showChoices(choices)
    
    // 3. Award points
    const selectedChoice = choices[selectedIndex]
    this.engine.points.set(this.id, selectedChoice.points)
    this.engine.pointsUpdated.next(
      Array.from(this.engine.points.values()).reduce((a, b) => a + b, 0)
    )
    
    // 4. Return connection for selected choice
    const outputKey = selectedChoice.output
    return {
      [outputKey]: this.getConnections(outputKey)
    }
  }
}
```

### Execution Flow

```typescript
class ScenarioEngine {
  async start() {
    // 1. Find StartNode
    const nodes = this.editor.getNodes()
    const startNode = nodes.find(n => n instanceof StartNode)
    
    if (!startNode) {
      throw new Error('No StartNode found')
    }
    
    // 2. Mark as started
    this.started.next(true)
    
    // 3. Execute from StartNode
    await this.controlflowEngine.execute(startNode.id)
    
    // 4. Mark as ended
    this.ended.next(true)
  }
  
  // ControlFlowEngine will call node.data() for each node
  // and follow connections to next nodes automatically
}
```

---

## 3D Scene Loading Pipeline

### Kompletny przepływ ładowania

```typescript
// 1. User clicks "Edit Scene" button
navigate(`/editor?trainingSceneUUID=${uuid}`)

// 2. EditorPage mount
useEffect(() => {
  const uuid = searchParams.get('trainingSceneUUID')
  setTrainingSceneUUID(uuid)
}, [location])

// 3. EditorManager initialization complete
useEffect(() => {
  if (!editorInitialized) return
  if (!editorApplicationStarted) return
  if (!trainingSceneUUID) return
  
  editorManager.loadTrainingScene(trainingSceneUUID)
}, [trainingSceneUUID, editorInitialized, editorApplicationStarted])

// 4. EditorManager.loadTrainingScene()
async loadTrainingScene(uuid: string): Promise<TrainingScene> {
  try {
    // 4.1. Fetch scene configuration JSON
    const response = await http.get(`/static/training-scene/${uuid}.json`)
    const sceneConfig: TrainingScene = response.data
    
    // 4.2. Load main scene GLB
    if (sceneConfig.sceneModelUrl) {
      this.loadingPercent.next(10)
      const sceneEntity = await this.sceneManager.loadScene(sceneConfig.sceneModelUrl)
      this.mainSceneChanged.next(sceneEntity)
      this.loadingPercent.next(40)
    }
    
    // 4.3. Load avatars
    if (sceneConfig.avatars && sceneConfig.avatars.length > 0) {
      for (let i = 0; i < sceneConfig.avatars.length; i++) {
        const avatarConfig = sceneConfig.avatars[i]
        
        const avatar = await this.avatarManager.loadAvatar(avatarConfig.modelUrl)
        avatar.setPosition(avatarConfig.position)
        avatar.setRotation(avatarConfig.rotation)
        
        this.loadingPercent.next(40 + (i + 1) / sceneConfig.avatars.length * 40)
      }
    }
    
    // 4.4. Load props/assets
    if (sceneConfig.props) {
      for (const prop of sceneConfig.props) {
        const asset = await this.assetsManager.loadAsset(prop.modelUrl)
        const entity = asset.resource.instantiateRenderEntity()
        entity.setPosition(prop.position)
        this.editableScene?.addChild(entity)
      }
    }
    
    // 4.5. Setup camera
    if (sceneConfig.cameraPosition) {
      this.cameraManager.setCameraPosition(sceneConfig.cameraPosition)
      this.cameraManager.lookAt(sceneConfig.cameraTarget || Vec3.ZERO)
    }
    
    // 4.6. Setup lighting
    if (sceneConfig.lights) {
      sceneConfig.lights.forEach(light => {
        const lightEntity = new Entity('Light')
        lightEntity.addComponent('light', {
          type: light.type,
          color: light.color,
          intensity: light.intensity
        })
        lightEntity.setPosition(light.position)
        this.app.root.addChild(lightEntity)
      })
    }
    
    this.loadingPercent.next(100)
    this.trainingSceneLoaded.next(sceneConfig)
    this.trainingSceneStarted.next(true)
    
    return sceneConfig
  } catch (error) {
    console.error('Failed to load training scene:', error)
    throw error
  }
}
```

### SceneManager.loadScene() internals

```typescript
async loadScene(url: string): Promise<Entity> {
  // 1. Create asset from URL
  const asset = await new Promise<Asset>((resolve, reject) => {
    this.app.assets.loadFromUrl(url, 'container', (err, asset) => {
      if (err) {
        reject(new Error(`Failed to load scene: ${err}`))
      } else {
        resolve(asset as Asset)
      }
    })
  })
  
  // 2. Instantiate GLB container
  const containerEntity = asset.resource.instantiateRenderEntity({
    preload: true // Load all resources immediately
  })
  
  // 3. Process scene hierarchy
  this.processSceneHierarchy(containerEntity)
  
  // 4. Add to scene
  this.app.root.addChild(containerEntity)
  this.mainScene = containerEntity
  
  // 5. Setup lighting if embedded
  const lights = this.findEntitiesByComponent(containerEntity, 'light')
  lights.forEach(light => {
    // Adjust light properties if needed
    if (light.light) {
      light.light.castShadows = true
    }
  })
  
  return containerEntity
}

private processSceneHierarchy(entity: Entity) {
  // Mark static geometry for optimization
  if (entity.render) {
    entity.render.castShadows = true
    entity.render.receiveShadows = true
  }
  
  // Add collision to static objects
  if (entity.render && !entity.collision) {
    const meshInstances = entity.render.meshInstances
    if (meshInstances.length > 0) {
      // Auto-generate collision mesh
      const bounds = new BoundingBox()
      meshInstances.forEach(mi => {
        bounds.add(mi.aabb.getMin())
        bounds.add(mi.aabb.getMax())
      })
      
      entity.addComponent('collision', {
        type: 'box',
        halfExtents: bounds.halfExtents
      })
      
      entity.addComponent('rigidbody', {
        type: 'static'
      })
    }
  }
  
  // Recursively process children
  entity.children.forEach(child => this.processSceneHierarchy(child))
}
```

---

## Authentication Flow

### Complete JWT Authentication Cycle

```typescript
// === FRONTEND: Login ===
const handleLogin = async (email: string, password: string) => {
  try {
    // 1. Send credentials
    const response = await AuthService.loginRequest({ email, password })
    
    // 2. Store tokens
    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('refreshToken', response.data.refreshToken)
    
    // 3. Redirect to dashboard
    navigate('/dashboard')
  } catch (error) {
    showError('Invalid credentials')
  }
}

// === FRONTEND: Axios Interceptor (automatic token injection) ===
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// === FRONTEND: Token Refresh on 401 ===
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Refresh token
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        })
        
        // Update stored token
        localStorage.setItem('accessToken', response.data.accessToken)
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`
        return http(originalRequest)
      } catch (refreshError) {
        // Refresh failed - logout
        localStorage.clear()
        window.location.href = '/auth/login'
      }
    }
    
    return Promise.reject(error)
  }
)
```

```csharp
// === BACKEND: Login Endpoint ===
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginDTO model)
{
    // 1. Find user
    var user = await _userManager.FindByEmailAsync(model.Email);
    if (user == null) return Unauthorized();
    
    // 2. Verify password
    if (!await _userManager.CheckPasswordAsync(user, model.Password))
        return Unauthorized();
    
    // 3. Get user roles
    var userRoles = await _userManager.GetRolesAsync(user);
    
    // 4. Create claims
    var authClaims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };
    
    foreach (var role in userRoles)
    {
        authClaims.Add(new Claim(ClaimTypes.Role, role));
    }
    
    // 5. Generate access token (15 min)
    var token = CreateToken(authClaims);
    
    // 6. Generate refresh token (7 days)
    var refreshToken = GenerateRefreshToken();
    user.RefreshToken = refreshToken;
    user.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);
    await _userManager.UpdateAsync(user);
    
    // 7. Return tokens
    return Ok(new
    {
        accessToken = token,
        refreshToken = refreshToken,
        expiresIn = 900 // 15 min in seconds
    });
}

// === BACKEND: Token Creation ===
private string CreateToken(List<Claim> authClaims)
{
    var authSigningKey = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(_configuration["JWT:Secret"])
    );
    
    var token = new JwtSecurityToken(
        issuer: _configuration["JWT:ValidIssuer"],
        audience: _configuration["JWT:ValidAudience"],
        expires: DateTime.Now.AddMinutes(15),
        claims: authClaims,
        signingCredentials: new SigningCredentials(
            authSigningKey, 
            SecurityAlgorithms.HmacSha256
        )
    );
    
    return new JwtSecurityTokenHandler().WriteToken(token);
}

// === BACKEND: Protected Endpoint ===
[HttpGet]
[Authorize] // Requires valid JWT
public async Task<ActionResult> GetProtectedData()
{
    // Get current user from claims
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
    
    // Check roles
    if (User.IsInRole("Admin"))
    {
        // Admin-only logic
    }
    
    return Ok(data);
}
```

---

## Data Synchronization

### Training Scene Auto-save

```typescript
class EditorComponent {
  useEffect(() => {
    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      saveTrainingScene()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  const saveTrainingScene = async () => {
    const sceneData = editorManager.exportSceneData()
    
    try {
      await http.post(`/static/training-scene/${trainingSceneUUID}.json`, sceneData)
      showToast('Auto-saved', 'Scene saved automatically', 'success')
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }
}
```

### Optimistic Updates

```typescript
const handleFavoriteToggle = async (training: TrainingData) => {
  // 1. Optimistic update (immediate UI feedback)
  setTrainings(prev => prev.map(t => 
    t.id === training.id ? { ...t, favorite: !t.favorite } : t
  ))
  
  try {
    // 2. API call
    await TrainingService.changeTrainingToFavorite({ 
      trainingId: training.id 
    })
  } catch (error) {
    // 3. Revert on error
    setTrainings(prev => prev.map(t => 
      t.id === training.id ? { ...t, favorite: !t.favorite } : t
    ))
    showError('Failed to update favorite')
  }
}
```

---

## Performance Optimization

### Frontend

**1. Code Splitting**
```typescript
// Lazy load pages
const DashboardPage = lazy(() => import('./pages/dashboard/dashboard.page'))
const EditorPage = lazy(() => import('./pages/editor/editor.page'))

<Suspense fallback={<Loading />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Suspense>
```

**2. Memo & useCallback**
```typescript
const MemoizedTrainingCard = memo(TrainingCard, (prevProps, nextProps) => {
  return prevProps.training.id === nextProps.training.id &&
         prevProps.training.favorite === nextProps.training.favorite
})

const handleClick = useCallback(() => {
  navigate(`/trainings/edit?id=${training.id}`)
}, [training.id, navigate])
```

**3. PlayCanvas LOD**
```typescript
// Use lower poly models for distant objects
const lodLevels = [
  { distance: 10, model: 'high_poly.glb' },
  { distance: 50, model: 'medium_poly.glb' },
  { distance: 100, model: 'low_poly.glb' }
]

app.on('update', () => {
  const distance = camera.getPosition().distance(entity.getPosition())
  const lod = lodLevels.find(l => distance < l.distance)
  if (lod && entity.currentLod !== lod) {
    switchModel(entity, lod.model)
    entity.currentLod = lod
  }
})
```

### Backend

**1. Query Optimization**
```csharp
// Select only needed fields
var trainings = await _context.Training
  .Select(t => new TrainingListDTO {
    Id = t.Id,
    Title = t.Title,
    Image = t.Image
    // Don't load TrainingSections for list view
  })
  .ToListAsync();

// Use AsNoTracking for read-only queries
var training = await _context.Training
  .AsNoTracking()
  .Include(t => t.TrainingSections)
  .FirstOrDefaultAsync(t => t.Id == id);
```

**2. Caching**
```csharp
private readonly IMemoryCache _cache;

public async Task<Configuration> GetEditorConfiguration()
{
  if (_cache.TryGetValue("EditorConfig", out Configuration config))
  {
    return config;
  }
  
  config = await LoadConfigurationFromFile();
  _cache.Set("EditorConfig", config, TimeSpan.FromHours(1));
  
  return config;
}
```

---

**Ostatnia aktualizacja:** 2025-11-11
