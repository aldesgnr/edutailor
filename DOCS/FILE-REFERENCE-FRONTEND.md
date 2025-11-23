# 📁 FRONTEND - SZCZEGÓŁOWY OPIS PLIKÓW

## bd-academy - Struktura i opis plików

---

## 🎯 Pliki główne (root)

### `package.json`
```json
{
  "name": "bd-academy",
  "dependencies": {
    "react": "^18.2.0",           // Framework UI
    "playcanvas": "^1.67.3",      // Silnik 3D
    "rete": "^2.0.2",             // Node-based editor
    "primereact": "^10.2.1",      // UI components
    "tailwindcss": "^3.3.3",      // CSS framework
    "axios": "^1.5.1",            // HTTP client
    "rxjs": "^7.8.1"              // Reactive programming
  }
}
```
**Przeznaczenie:** Definicja zależności projektu i skrypty npm

**Skrypty:**
- `npm run dev` - dev server (Vite)
- `npm run build` - produkcja build
- `npm run preview` - podgląd buildu

### `vite.config.ts`
```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_BD_ACADEMY_')
  return {
    base: env.VITE_BD_ACADEMY_BASE_URL,  // Base path dla routingu
    plugins: [
      basicSsl(),        // HTTPS w dev
      svgr(),           // SVG jako React komponenty
      react()           // JSX transform
    ]
  }
})
```
**Przeznaczenie:** Konfiguracja buildera Vite

**Kluczowe opcje:**
- `base` - base URL dla aplikacji (np. `/braindance.ilms`)
- `plugins` - transformacje kodu (React, SVG, SSL)

### `tsconfig.json`
**Przeznaczenie:** TypeScript compiler configuration

**Ważne opcje:**
- `target: "ES2020"` - docelowa wersja JS
- `jsx: "react-jsx"` - React 18 JSX transform
- `strict: true` - strict type checking

### `.env-sample` / `.env`
```bash
VITE_BD_ACADEMY_BASE_URL=/braindance.ilms
VITE_BD_ACADEMY_SIMPLE_MODELS=false        # Uproszczone modele dla performance
VITE_BD_ACADEMY_VIEWER_DEBUG=false         # Debug logs w viewerze
VITE_BD_ACADEMY_EDITOR_DEBUG=false         # Debug logs w edytorze
VITE_BD_ACADEMY_STATIC_URL=http://localhost:5008
VITE_BD_ACADEMY_API_URL=https://localhost:5007
```
**Przeznaczenie:** Zmienne środowiskowe
**Dostęp:** `import.meta.env.VITE_BD_ACADEMY_*`

### `tailwind.config.js`
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#66C596',      // Główny kolor
        'dark-800': '#1A1A1A',  // Tło dark mode
        // ... custom colors
      }
    }
  }
}
```
**Przeznaczenie:** Konfiguracja TailwindCSS

---

## 📂 src/ - Główny kod źródłowy

### `src/main.tsx`
**Przeznaczenie:** Entry point aplikacji React

**Kluczowe elementy:**
```typescript
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrimeReactProvider value={{ /* custom PT config */ }}>
      <App />
    </PrimeReactProvider>
  </React.StrictMode>
)
```

**Funkcjonalności:**
- Inicjalizacja React app
- Konfiguracja PrimeReact (PassThrough API)
- Wczytanie Tailwind custom colors do CSS variables
- Import globalnych stylów i fontów

### `src/App.tsx`
**Przeznaczenie:** Root component aplikacji

```typescript
function App() {
  return (
    <div className="App">
      <AppRouter />  {/* Routing system */}
    </div>
  )
}
```

### `src/app.config.ts`
**Przeznaczenie:** Centralna konfiguracja z zmiennych env

```typescript
export const appConfig = () => {
  const BASE_URL = import.meta.env.VITE_BD_ACADEMY_BASE_URL
  const API_URL = import.meta.env.VITE_BD_ACADEMY_API_URL
  const STATIC_URL = import.meta.env.VITE_BD_ACADEMY_STATIC_URL
  const EDITOR_DEBUG = import.meta.env.VITE_BD_ACADEMY_EDITOR_DEBUG === 'true'
  return { BASE_URL, API_URL, STATIC_URL, EDITOR_DEBUG, ... }
}
```

---

## 📄 src/router/

### `router.tsx`
**Przeznaczenie:** Główna konfiguracja routingu React Router

**Struktura:**
```typescript
<BrowserRouter basename={basePath}>
  <NotificationProvider>
    <TrainingProvider>
      <EditorProvider>
        <Routes>
          {/* Unprotected routes */}
          <Route element={<UnProtectedRoute />}>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
          </Route>
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/dialog" element={<DialogPage />} />
            <Route path="/viewer" element={<ViewerPage />} />
          </Route>
        </Routes>
      </EditorProvider>
    </TrainingProvider>
  </NotificationProvider>
</BrowserRouter>
```

**Providers:**
- `NotificationProvider` - toast notifications
- `TrainingProvider` - stan treningów
- `EditorProvider` - EditorManager i ViewerManager singletons

### `protected-route.tsx`
**Przeznaczenie:** Route guards dla autentykacji

```typescript
export const ProtectedRoute = () => {
  const isAuthenticated = checkAuth() // JWT token validation
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" />
}
```

---

## 📄 src/pages/

### `pages/dashboard/dashboard.page.tsx`
**Przeznaczenie:** Strona główna - dashboard z kartami treningów

**Funkcjonalności:**
- Lista aktywnych treningów
- Drafts (szkice)
- Favorites (ulubione)
- Karuzela scroll (left/right buttons)
- Quick actions (new training)

**State:**
```typescript
const [trainings, setTrainings] = useState<TrainingData[]>([])
const [drafts, setDrafts] = useState<TrainingData[]>([])
const [favorites, setFavorites] = useState<TrainingData[]>([])
```

**API calls:**
- `TrainingService.getTrainings()` - pobiera wszystkie treningi
- `TrainingService.changeTrainingToFavorite()` - toggle favorite

### `pages/editor/editor.page.tsx`
**Przeznaczenie:** Strona edytora scen 3D

**Flow:**
1. Pobiera `trainingSceneUUID` z URL query params
2. Inicjalizuje `EditorManager`
3. Ładuje konfigurację sceny: `editorManager.loadTrainingScene(uuid)`
4. Renderuje `<EditorComponent>`

**Observables subscription:**
```typescript
useEffect(() => {
  const progressSub = editorManager.loadingPercent.subscribe(setProgressValue)
  const initSub = editorManager.initialized.subscribe(setEditorInitialized)
  const sceneSub = editorManager.trainingSceneLoaded.subscribe(setTrainingScene)
  
  return () => {
    progressSub.unsubscribe()
    initSub.unsubscribe()
    sceneSub.unsubscribe()
  }
}, [editorManager])
```

### `pages/viewer/viewer.page.tsx`
**Przeznaczenie:** Strona odtwarzania treningów (player mode)

**Różnice vs Editor:**
- Read-only mode
- Brak transform controls
- Fokus na UX odtwarzania
- VR mode support

**Flow:**
1. Pobiera `trainingSceneUUID` z URL
2. Inicjalizuje `ViewerManager`
3. Włącza rendering: `viewerManager.enableRender = true`
4. Renderuje `<ViewerComponent>`

### `pages/dialog/dialog.page.tsx`
**Przeznaczenie:** Edytor scenariuszy (node-based dialog editor)

**Kluczowe elementy:**
- Rete.js canvas
- Node palette (Start, NPC, Statement, End)
- Connection drawing
- Context menu
- Save/Load dialog graph

### `pages/training/training.page.tsx`
**Przeznaczenie:** Lista wszystkich treningów (table view)

**Funkcjonalności:**
- Filtrowanie (DRAFT/PUBLISHED)
- Sortowanie
- Search
- CRUD actions (edit/delete)

### `pages/login/login.page.tsx`
**Przeznaczenie:** Strona logowania

**Form fields:**
- Email
- Password

**Flow:**
```typescript
const handleSubmit = async (data: LoginFormFields) => {
  const response = await AuthService.loginRequest(data)
  localStorage.setItem('accessToken', response.data.accessToken)
  navigate('/dashboard')
}
```

---

## 📄 src/components/

### `components/editor/editor.component.tsx`
**Przeznaczenie:** Główny komponent edytora 3D

**Struktura:**
```typescript
<div className="editor-container">
  <Toolbar />
  <LeftPanel>
    <SceneSelector />
    <AvatarList />
    <AssetList />
  </LeftPanel>
  
  <Canvas ref={canvasRef} />  {/* PlayCanvas canvas */}
  
  <RightPanel>
    <PropertiesPanel />
    <TransformPanel />
  </RightPanel>
  
  <BottomPanel>
    <LoadingProgress />
  </BottomPanel>
</div>
```

**Responsywności:**
- Dodaje canvas do DOM: `containerRef.current.appendChild(editorManager.canvas)`
- Cleanup on unmount: `editorManager.reset()`

### `components/viewer/viewer.component.tsx`
**Przeznaczenie:** Player komponent (odtwarzanie)

**Główne elementy:**
- PlayCanvas canvas (fullscreen)
- Dialog UI overlay
- Progress bar
- VR toggle button
- Scenario execution UI

### `components/training/training-card.component.tsx`
**Przeznaczenie:** Karta treningu (reusable component)

**Props:**
```typescript
export type TrainingCardProps = {
  training: TrainingData
  onClick?: (training: TrainingData) => void
  onFavoriteToggle?: (training: TrainingData) => void
  type?: 'grid' | 'list'
}
```

**Wyświetla:**
- Title, description
- Image thumbnail
- Duration time
- Tags/labels
- Favorite icon (toggle)
- Edit/Delete actions

---

## 📄 src/lib/ - Biblioteki 3D

### `lib/editor-manager/editor-manager.ts`
**Przeznaczenie:** Główny manager trybu edycji (dziedziczy z ViewerManager)

**Główne responsywności:**
- Zarządzanie editable scene
- Transform controls (translate/rotate/scale)
- Object selection z outline
- Avatar/Asset placement
- Scene export/import
- Collision detection

**Publiczne API:**
```typescript
class EditorManager extends ViewerManager {
  // Observables
  public selectedAvatar: BehaviorSubject<Avatar | null>
  public selectedAsset: BehaviorSubject<Entity | null>
  public editableSceneChanged: BehaviorSubject<Entity | null>
  
  // Managers
  public scriptManager: ScriptManager  // Transform controls, object selector
  public sceneManager: SceneManager    // Scene loading
  public avatarManager: AvatarManager  // Avatar management
  
  // Methods
  public async loadTrainingScene(uuid: string): Promise<TrainingScene>
  public async loadEditorConfiguration(): Promise<Configuration>
  public selectObject(entity: Entity): void
  public deleteSelectedObject(): void
  public set transformControlsMode(mode: 'translate' | 'rotate' | 'scale')
}
```

**Flow inicjalizacji:**
```
constructor()
  → super() (ViewerManager init)
  → loadEditorConfiguration()
    → GET /static/common/editor-configuration.json
    → Parse scenes, avatars, assets
  → Initialize managers
    → scriptManager (transform controls, object selector)
    → sceneManager (scene loading)
    → avatarManager (avatar placement)
```

### `lib/viewer-manager/viewer-manager.ts`
**Przeznaczenie:** Base manager dla viewer mode (odtwarzanie)

**Responsywności:**
- PlayCanvas Application initialization
- Asset loading pipeline
- Camera management
- Physics (Ammo.js)
- WebXR setup
- Scene rendering loop

**Główne komponenty:**
```typescript
class ViewerManager {
  // PlayCanvas app
  public app: Application
  
  // Managers
  protected assetsManager: AssetsManager
  protected animationManager: AnimationManager
  protected ammoManager: AmmoManager
  protected cameraManager: CameraManager
  protected sceneManager: SceneManager
  protected avatarManager: AvatarManager
  protected scenarioEngine: ScenarioEngine
  protected webXrManager: WebXrManager
  
  // Observables
  public loadingPercent: BehaviorSubject<number>
  public initialized: BehaviorSubject<boolean>
  public trainingSceneLoaded: BehaviorSubject<TrainingScene | null>
  
  // Methods
  public async initialize(): Promise<void>
  public async loadTrainingScene(uuid: string): Promise<void>
  public startTraining(): void
  public reset(): void
}
```

**Rendering loop:**
```typescript
this.app.on('update', (dt) => {
  if (!this._enableRender) return
  
  // Execute registered updates
  this.updates.forEach(fn => fn(dt))
  
  // Physics simulation
  this.ammoManager.update(dt)
  
  // Scenario engine execution
  this.scenarioEngine.update(dt)
})
```

### `lib/scenarion-engine/scenarion-engine.ts`
**Przeznaczenie:** Silnik wykonywania scenariuszy dialogowych (Rete.js)

**Kluczowe elementy:**
```typescript
class ScenarioEngine {
  public editor: NodeEditor<Schemes>          // Rete editor
  public controlflowEngine: ControlFlowEngine // Execution engine
  public area: AreaPlugin                     // Canvas area
  private connection: ConnectionPlugin        // Node connections
  private contextMenu: ContextMenuPlugin      // Right-click menu
  
  // Execution state
  public started: BehaviorSubject<boolean>
  public ended: Subject<boolean>
  public pointsUpdated: BehaviorSubject<number>
  
  // UI entities
  public scenarioEngineScreenEntity: Entity   // Dialog UI overlay
  public textDialogMiddelware: TextDialogMiddelware
  
  // Methods
  public async loadDialog(uuid: string): Promise<DialogJson>
  public async start(): Promise<void>
  public async execute(nodeId: string): Promise<void>
  public reset(): void
}
```

**Node types:**
- `StartNode` - początek scenariusza
- `NPCNode` - wypowiedź NPC (show dialog bubble)
- `StatementNode` - wybór gracza (multiple choice)
- `HintNode` - podpowiedź
- `SummaryPointsNode` - podsumowanie punktów
- `EndNode` - koniec scenariusza

**Execution flow:**
```
start()
  → Find StartNode
  → controlflowEngine.execute(startNode.id)
    → StartNode.data()
      → Return output connections
    → Follow first connection → NPCNode
      → Display NPC dialog in 3D UI
      → Wait for user click
    → Follow connection → StatementNode
      → Display player choices
      → Wait for selection
      → Award points based on choice
    → Continue until EndNode
  → ended.next(true)
```

### `lib/scene-manager/scene-manager.ts`
**Przeznaczenie:** Zarządzanie scenami 3D (loading, hierarchy)

**Responsywności:**
```typescript
class SceneManager {
  // Main scene entities
  public mainScene: Entity | null
  public editableScene: Entity | null
  
  // Methods
  public async loadScene(sceneUrl: string): Promise<Entity>
  public setActiveScene(scene: Entity): void
  public findEntityByName(name: string): Entity | null
  public getSceneHierarchy(): EntityNode[]
}
```

**Scene hierarchy:**
```
app.root
  ├── mainScene (loaded GLB)
  │   ├── environment
  │   ├── lights
  │   └── geometry
  ├── editableScene (editor only)
  │   ├── avatars
  │   └── props
  ├── camera
  └── ui
```

### `lib/camera-manager/camera-manager.ts`
**Przeznaczenie:** Kontrola kamery

**Camera types:**
```typescript
class CameraManager {
  public editorCamera: Entity      // Orbit camera (editor mode)
  public firstPersonCamera: Entity // FPS camera (viewer mode)
  public activeCamera: BehaviorSubject<Entity>
  
  public switchToOrbitCamera(): void
  public switchToFirstPersonCamera(): void
  public setCameraPosition(pos: Vec3): void
  public lookAt(target: Vec3): void
}
```

### `lib/avatar-manager/avatar-manager.ts`
**Przeznaczenie:** Zarządzanie postaciami NPC

```typescript
class AvatarManager {
  private avatars: Map<string, Avatar>
  
  public async loadAvatar(avatarId: string): Promise<Avatar>
  public addAvatar(avatar: Avatar, position: Vec3): void
  public removeAvatar(avatarId: string): void
  public playAnimation(avatarId: string, animName: string): void
}

class Avatar {
  public id: string
  public entity: Entity
  public model: Asset
  public animations: Map<string, Asset>
  
  public playAnimation(name: string): void
  public setPosition(pos: Vec3): void
  public lookAt(target: Vec3): void
}
```

### `lib/transform-controls/transform-controls.ts`
**Przeznaczenie:** Gizmo dla transformacji obiektów (translate/rotate/scale)

**Modes:**
- `translate` - przesuwanie (XYZ axes)
- `rotate` - obracanie (XYZ circles)
- `scale` - skalowanie (XYZ handles)

**Usage:**
```typescript
transformControls.attach(entity)
transformControls.mode = 'translate'

transformControls.on('change', () => {
  // Update properties panel
})
```

---

## 📄 src/services/

### `services/auth.service.ts`
**Przeznaczenie:** API calls dla autentykacji

```typescript
class AuthService {
  static loginRequest(data: LoginFormFields): Promise<{ accessToken: string }>
  static registerRequest(data: RegisterFormFields): Promise<void>
  static forgotPasswordRequest(data: { email: string }): Promise<void>
  static resetPasswordRequest(data: ResetPasswordFields): Promise<void>
  static changePassword(oldPassword: string, newPassword: string): Promise<void>
}
```

### `services/training.service.ts`
**Przeznaczenie:** API calls dla treningów

```typescript
class TrainingService {
  static getTrainings(): Promise<TrainingData[]>
  static getTraining(id: string): Promise<TrainingData>
  static updateTraining(id: string, data: TrainingData): Promise<void>
  static changeTrainingToFavorite(data: { trainingId: string }): Promise<void>
}
```

---

## 📄 src/contexts/

### `contexts/editor-context.tsx`
**Przeznaczenie:** React Context dla EditorManager i ViewerManager (singletons)

```typescript
const defEditorManager = new EditorManager()
const defViewerManager = new ViewerManager()

const EditorContext = createContext({
  editorManager: defEditorManager,
  viewerManager: defViewerManager
})

// Usage
const { editorManager } = useContext(EditorContext)
```

**Dlaczego singleton?**
- PlayCanvas Application może być tylko jedno instance
- Managers muszą przetrwać między route changes
- Shared state między komponentami

---

**Ostatnia aktualizacja:** 2025-11-11
