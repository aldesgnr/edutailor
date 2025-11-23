# 🏗️ ARCHITEKTURA PROJEKTU EDUTAILOR.AI

## Spis treści
- [Przegląd systemu](#przegląd-systemu)
- [Architektura wysokopoziomowa](#architektura-wysokopoziomowa)
- [Moduły projektu](#moduły-projektu)
- [Flow danych](#flow-danych)
- [Diagramy](#diagramy)

---

## Przegląd systemu

**EduTailor.ai** (wcześniej ILMS) to platforma do tworzenia interaktywnych treningów 3D/VR z naciskiem na:
- Symulacje dialogowe (np. lekarz-pacjent)
- Interaktywne sceny 3D
- Node-based scenario editor
- WebXR/VR support

### Kluczowe funkcjonalności:
1. **Edytor scen 3D** - pozycjonowanie obiektów, awatarów w przestrzeni 3D
2. **Edytor scenariuszy** - tworzenie grafów dialogowych (node-based)
3. **Viewer/Player** - odtwarzanie treningów (desktop/VR)
4. **System zarządzania** - CRUD treningów, użytkowników, autoryzacja

---

## Architektura wysokopoziomowa

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser/VR)                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         bd-academy (React + PlayCanvas)              │  │
│  │                                                      │  │
│  │  ├── Pages (Dashboard, Editor, Viewer, Dialog)      │  │
│  │  ├── Lib (3D Managers)                              │  │
│  │  ├── Components (UI)                                │  │
│  │  └── Services (API calls)                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS (REST API)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    bd-academy-backend                       │
│                   (ASP.NET Core 7 + MySQL)                  │
│                                                             │
│  ├── Auth Module      (JWT, login, register)               │
│  ├── Training Module  (CRUD, sections, components)         │
│  ├── User Module      (profile, roles)                     │
│  └── Shared Module    (utilities, data provider)           │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ MySQL Connection
                            ▼
                    ┌───────────────┐
                    │  MySQL DB     │
                    │  (academy)    │
                    └───────────────┘

┌─────────────────────────────────────────────────────────────┐
│              bd-academy-static (Node.js)                    │
│                    Static File Server                       │
│                                                             │
│  /static/common/                                            │
│    ├── scenes/         (GLB models)                         │
│    ├── avatar/         (Character models)                   │
│    ├── animations/     (Animation files)                    │
│    ├── assets/         (Props, objects)                     │
│    └── editor-configuration.json                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Moduły projektu

### 1. **bd-academy** (Frontend)

**Technologie:**
- React 18 + TypeScript
- Vite (bundler)
- PlayCanvas Engine (3D/WebGL)
- Rete.js (node editor)
- PrimeReact + TailwindCSS (UI)
- RxJS (reactive state)

**Struktura katalogów:**
```
bd-academy/
├── src/
│   ├── pages/              # Strony aplikacji
│   │   ├── dashboard/      # Panel główny
│   │   ├── editor/         # Edytor scen 3D
│   │   ├── dialog/         # Edytor dialogów
│   │   ├── viewer/         # Player treningów
│   │   ├── training/       # Lista treningów
│   │   ├── login/          # Autentykacja
│   │   └── settings/       # Ustawienia
│   │
│   ├── lib/                # Biblioteki 3D/silnik
│   │   ├── editor-manager/     # Zarządzanie edytorem
│   │   ├── viewer-manager/     # Zarządzanie viewerem
│   │   ├── scenarion-engine/   # Silnik scenariuszy
│   │   ├── scene-manager/      # Zarządzanie scenami
│   │   ├── camera-manager/     # Kontrola kamery
│   │   ├── avatar-manager/     # Awatary/postacie
│   │   ├── animation-manager/  # Animacje
│   │   ├── assets-manager/     # Zasoby
│   │   ├── transform-controls/ # Narzędzia transformacji
│   │   ├── orbit-control/      # Orbit camera
│   │   ├── object-selector/    # Selekcja obiektów
│   │   └── webxr-manager/      # VR support
│   │
│   ├── components/         # Komponenty React
│   │   ├── common/         # Wspólne komponenty
│   │   ├── editor/         # Komponenty edytora
│   │   ├── viewer/         # Komponenty viewera
│   │   ├── dialog/         # Komponenty dialogów
│   │   ├── training/       # Komponenty treningów
│   │   └── script/         # Komponenty skryptów
│   │
│   ├── services/           # API services
│   │   ├── auth.service.ts
│   │   ├── training.service.ts
│   │   ├── login-manager.service.ts
│   │   └── notification.service.tsx
│   │
│   ├── contexts/           # React Contexts
│   │   ├── editor-context.tsx
│   │   ├── training-context.tsx
│   │   └── notification-context.tsx
│   │
│   ├── router/             # Routing
│   │   ├── router.tsx
│   │   └── protected-route.tsx
│   │
│   └── api-client/         # Auto-generated API client
│
├── public/                 # Statyczne assety
└── dist/                   # Build output
```

**Kluczowe koncepty:**

#### **EditorManager vs ViewerManager**
- `EditorManager` - tryb edycji (pełna kontrola nad sceną)
- `ViewerManager` - tryb odtwarzania (read-only, player)
- Oba dziedziczą wspólną logikę inicjalizacji PlayCanvas

#### **Managers Pattern**
Każdy manager odpowiada za konkretny obszar funkcjonalności:
- Inicjalizacja w konstruktorze
- Observable state (RxJS BehaviorSubject)
- Metody publiczne do kontroli
- Cleanup w metodzie reset/destroy

---

### 2. **bd-academy-backend** (Backend)

**Technologie:**
- ASP.NET Core 7.0
- Entity Framework Core
- MySQL (Pomelo provider)
- JWT Bearer Authentication
- Swagger/OpenAPI

**Struktura modułowa:**
```
bd-academy-backend/
├── bd-academy-backend/
│   ├── Modules/
│   │   ├── Auth/
│   │   │   ├── AuthController.cs       # Login, register, reset password
│   │   │   └── DTOs/                   # Data transfer objects
│   │   │
│   │   ├── Training/
│   │   │   ├── Controllers/
│   │   │   │   ├── TrainingsController.cs
│   │   │   │   ├── TrainingSectionComponentController.cs
│   │   │   │   └── TrainingFavoriteController.cs
│   │   │   ├── Models/
│   │   │   │   ├── Training.cs
│   │   │   │   ├── TrainingSection.cs
│   │   │   │   ├── TrainingSectionComponent.cs
│   │   │   │   ├── TrainingValue.cs
│   │   │   │   └── TrainingFavorite.cs
│   │   │   └── DTOs/
│   │   │
│   │   ├── User/
│   │   │   ├── Models/
│   │   │   │   └── User.cs             # ASP.NET Identity User
│   │   │   ├── UserService.cs
│   │   │   └── DTOs/
│   │   │
│   │   └── Shared/
│   │       └── Services/
│   │           └── DataProvider.cs     # Seed data (admin, roles)
│   │
│   ├── AppDBContext.cs                 # EF Core DbContext
│   ├── Program.cs                      # App configuration
│   ├── Migrations/                     # EF migrations
│   └── appsettings.json                # Configuration
│
└── api-clients/                        # Generated clients
```

**Database Schema:**
```sql
-- Identity tables (AspNet*)
AspNetUsers
AspNetRoles
AspNetUserRoles
AspNetUserClaims
AspNetRoleClaims

-- Training system
Training
  - Id (PK, Guid)
  - Title
  - Description
  - Image
  - DurationTime
  - Type (DRAFT/PUBLISHED)
  - Published
  - AvailableUntil
  - CreatedAt, UpdatedAt, DeletedAt

TrainingSection
  - Id (PK, Guid)
  - TrainingId (FK)
  - Title
  - CreatedAt, UpdatedAt, DeletedAt

TrainingSectionComponent
  - Id (PK, Guid)
  - TrainingSectionId (FK)
  - Title
  - Description
  - Type (QUIZ/FILE/SCENE)
  - DialogId (Guid?)
  - CreatedAt, UpdatedAt, DeletedAt

TrainingValue
  - TrainingId (FK)
  - Value (metadata/tags)

TrainingFavorite
  - TrainingId (FK)
  - UserId (FK)

TrainingFile
  - TrainingId (FK)
  - FilePath

TrainingCreator
  - Id (PK)
  - UserId (FK)

Training_TrainingCreator (Many-to-Many)
```

---

### 3. **bd-academy-static** (Static Files)

**Cel:** Serwowanie plików statycznych (modele 3D, tekstury, konfiguracja)

**Struktura:**
```
bd-academy-static/
├── static/
│   ├── common/
│   │   ├── editor-configuration.json   # Centralna konfiguracja
│   │   ├── scenes/                     # Sceny GLB
│   │   │   ├── doctor_clinic_compressed_smm.glb
│   │   │   └── ilms_room_v3.glb
│   │   ├── avatar/                     # Modele postaci GLB + PNG
│   │   │   ├── 652d15c12b0b061b5bce48cb.glb  # Walter White (doctor)
│   │   │   ├── 652e25292b0b061b5bd12d42.glb  # Harold Pain (patient)
│   │   │   └── 652d1611811453cd5dc2e26c.glb  # Mia Green (nurse)
│   │   ├── animations/                 # Animacje GLB
│   │   │   ├── F_Standing_Idle_Variations_002.glb
│   │   │   └── M_Talking_Variations_002.glb
│   │   ├── assets/                     # Props/obiekty
│   │   │   └── assets_lamp.glb
│   │   └── fonts/
│   │       └── courier.json
│   │
│   ├── training/                       # Dane treningów (JSON)
│   ├── training-dialog/                # Dialogi treningów
│   └── training-scene/                 # Konfiguracja scen
│
└── index.js                            # Node.js HTTP server
```

**editor-configuration.json:**
```json
{
  "id": "54e701fa-e2f1-4385-8e2f-b9be47d690d0",
  "fonts": [...],
  "scenes": [
    {
      "id": "uuid",
      "name": "Doctor's clinic",
      "model": "/static/common/scenes/doctor_clinic.glb",
      "previewSceneTraining": "uuid",
      "avatars": ["Person_1"]
    }
  ],
  "avatars": [
    {
      "id": "uuid",
      "model": "/static/common/avatar/model.glb",
      "image": "/static/common/avatar/model.png",
      "gender": "male",
      "name": "Walter White",
      "type": "doctor"
    }
  ],
  "assets": [...],
  "animations": [...]
}
```

---

## Flow danych

### **1. Tworzenie treningu**

```
User → Dashboard → Click "New Training"
  ↓
Training Form (title, description, type)
  ↓
POST /api/Trainings → Backend creates Training entity
  ↓
Redirect to /trainings/edit?trainingUUID=xxx
  ↓
User adds TrainingSection
  ↓
User adds TrainingSectionComponent (type: SCENE)
  ↓
Click "Edit Scene" → Redirect to /editor?trainingSceneUUID=xxx
  ↓
EditorManager.loadTrainingScene(uuid)
  ↓
GET /static/training-scene/{uuid}.json
  ↓
Load Scene GLB → Load Avatars → Position objects
  ↓
User saves → POST /api/TrainingSectionComponent/{id}
  ↓
Click "Edit Dialog" → Redirect to /dialog?dialogUUID=xxx
  ↓
ScenarioEngine.loadDialog(uuid)
  ↓
User creates node graph (Start → NPC → Statement → End)
  ↓
Save dialog → POST /static/training-dialog/{uuid}.json
  ↓
Publish → Training.Published = true
```

### **2. Odtwarzanie treningu**

```
User → Dashboard → Click training card
  ↓
Redirect to /viewer?trainingSceneUUID=xxx
  ↓
ViewerManager.initialize()
  ↓
GET /api/TrainingSectionComponent/{id}
  ↓
GET /static/training-scene/{uuid}.json (scene config)
  ↓
GET /static/training-dialog/{dialogId}.json (dialog graph)
  ↓
Load Scene GLB from /static/common/scenes/
  ↓
Load Avatars from /static/common/avatar/
  ↓
ScenarioEngine.start(dialogGraph)
  ↓
Execute node graph:
  - StartNode → display intro
  - NPCNode → show NPC speech bubble
  - StatementNode → show player choices
  - User selects option → navigate graph
  - SummaryPointsNode → show score
  - EndNode → training complete
```

### **3. Autentykacja**

```
User → /auth/login
  ↓
POST /auth/login (email, password)
  ↓
Backend validates credentials (Identity)
  ↓
Generate JWT token + Refresh token
  ↓
Return { accessToken, refreshToken }
  ↓
Frontend stores in localStorage
  ↓
All API requests include: Authorization: Bearer {accessToken}
  ↓
Token expires → Auto-refresh with refreshToken
```

---

## Diagramy

### **Component Hierarchy (Frontend)**

```
App
├── Router (BrowserRouter)
│   ├── NotificationProvider
│   │   ├── TrainingProvider
│   │   │   └── EditorProvider
│   │   │       ├── EditorManager (singleton)
│   │   │       └── ViewerManager (singleton)
│   │   │
│   │   └── Routes
│   │       ├── UnProtectedRoute (auth layout)
│   │       │   ├── /auth/login
│   │       │   ├── /auth/register
│   │       │   └── /auth/forgot-password
│   │       │
│   │       └── ProtectedRoute (app layout)
│   │           ├── /dashboard
│   │           ├── /trainings
│   │           ├── /editor
│   │           ├── /dialog
│   │           ├── /viewer
│   │           └── /settings
```

### **Manager Dependencies**

```
ViewerManager (base class)
├── app: PlayCanvas Application
├── assetsManager: AssetsManager
├── animationManager: AnimationManager
├── ammoManager: AmmoManager (physics)
├── cameraManager: CameraManager
├── sceneManager: SceneManager
├── avatarManager: AvatarManager
├── scriptManager: ScriptManager
├── scenarioEngine: ScenarioEngine
├── webXrManager: WebXrManager
└── loaderHandleManager: LoaderHandleManager

EditorManager extends ViewerManager
├── + selectedAvatar: BehaviorSubject<Avatar>
├── + selectedAsset: BehaviorSubject<Entity>
├── + objectToReplace: BehaviorSubject<Entity>
├── + transformControls: TransformControls
└── + objectSelector: ObjectSelector
```

### **ScenarioEngine Node Types**

```
BaseNode (abstract)
├── StartNode              # Początek scenariusza
├── EndNode                # Koniec scenariusza
├── ParentNode             # Grupowanie węzłów
├── BaseDialogNode (abstract)
│   ├── NPCNode            # Wypowiedź NPC
│   ├── StatementNode      # Wybór gracza
│   └── HintNode           # Podpowiedź
└── SummaryPointsNode      # Podsumowanie punktów
```

---

## Kluczowe zasady architektoniczne

### **1. Separation of Concerns**
- **Frontend:** UI + 3D rendering + state management
- **Backend:** Business logic + data persistence + auth
- **Static:** Asset delivery (CDN-like)

### **2. Manager Pattern**
Każdy manager to singleton odpowiedzialny za jeden obszar:
- Inicjalizacja w konstruktorze
- Observable state (BehaviorSubject)
- Public API methods
- Cleanup/reset methods

### **3. Reactive State (RxJS)**
```typescript
// Przykład
public initialized = new BehaviorSubject<boolean>(false)

// Subscribe w komponencie
useEffect(() => {
  const sub = manager.initialized.subscribe(value => {
    setIsInitialized(value)
  })
  return () => sub.unsubscribe()
}, [])
```

### **4. DTO Pattern (Backend)**
```csharp
// Model (database)
public class Training {
  public Guid Id { get; set; }
  public string Title { get; set; }
  public List<TrainingSection> TrainingSections { get; set; }
}

// DTO (API)
public class TrainingDTO {
  public Guid Id { get; set; }
  public string Title { get; set; }
  public List<TrainingSectionDTO> TrainingSections { get; set; }
}

// Conversion
public TrainingDTO toDTO() {
  return new TrainingDTO {
    Id = this.Id,
    Title = this.Title,
    TrainingSections = this.TrainingSections.Select(s => s.toDTO())
  };
}
```

### **5. API Client Auto-generation**
```bash
# Backend generuje OpenAPI spec
dotnet swagger tofile --output api-clients/openapi.json

# Docker generuje TypeScript client
docker run openapitools/openapi-generator-cli generate \
  -i /local/api-clients/openapi.json \
  -g typescript-axios \
  -o /local/api-clients/typescript-axios

# Kopiowanie do frontendu
copy api-clients/typescript-axios/* bd-academy/src/api-client/
```

---

## Performance Considerations

### **Frontend**
- **Lazy loading:** Route-based code splitting
- **Asset streaming:** Progressive loading GLB models
- **LOD (Level of Detail):** Simplified models for distant objects
- **Object pooling:** Reuse entities instead of create/destroy
- **Culling:** Frustum culling, occlusion culling

### **Backend**
- **Eager loading:** Include related entities to avoid N+1 queries
- **Pagination:** Limit result sets
- **Caching:** Static configuration in memory
- **Connection pooling:** Database connection reuse

### **Static Server**
- **CDN-ready:** Can be moved to CloudFront/Cloudflare
- **Compression:** Gzip/Brotli for JSON files
- **Caching headers:** Long TTL for immutable assets

---

## Security

### **Authentication Flow**
1. User logs in → Backend validates
2. Backend generates JWT (15 min) + Refresh Token (7 days)
3. Frontend stores tokens in localStorage
4. Every API call includes: `Authorization: Bearer {JWT}`
5. JWT expires → Frontend auto-refreshes using Refresh Token
6. Refresh token expires → User must re-login

### **Authorization**
- Role-based access control (RBAC)
- Roles: `Admin`, `User`, `Creator`
- Protected routes in frontend (ProtectedRoute wrapper)
- `[Authorize]` attribute in backend controllers

### **CORS**
```csharp
// Backend allows all origins in dev
builder.Services.AddCors(options => {
  options.AddPolicy("allowSpecificOrigins", policyBuilder => {
    policyBuilder.WithOrigins("*")
      .AllowAnyHeader()
      .AllowAnyMethod();
  });
});
```

---

## Deployment Architecture

### **Production (VPS 185.201.114.251)**
```
Nginx (reverse proxy)
  ↓
  ├─→ Frontend (port 443) → /braindance.ilms/
  ├─→ Backend API (port 5007) → systemctl (ilms-api)
  └─→ Static Server (port 5008) → PM2 (index.js)
       ↓
MySQL (port 3306, localhost)
```

### **Development**
```
Frontend: npm run dev (Vite dev server, port 5173)
Backend: dotnet run (port 5007, HTTPS)
Static: node index.js 5008
Database: MySQL (XAMPP/Docker)
```

---

## Kolejne kroki rozwoju

### **Krótkoterminowe**
- [ ] Fix black screen issue (TODO.MD)
- [ ] Undo/Redo w edytorze
- [ ] Bulk operations (multi-select)
- [ ] Search/filter trainings

### **Średnioterminowe**
- [ ] bd-academy-lms (Frappe)
- [ ] bd-academy-onepage (landing page)
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

### **Długoterminowe**
- [ ] AI-generated dialogs (GPT integration)
- [ ] Multiplayer scenarios
- [ ] Marketplace (sprzedaż treningów)
- [ ] SCORM/xAPI compliance
- [ ] Advanced VR features (hand tracking)

---

## Przydatne linki

- **PlayCanvas Docs:** https://developer.playcanvas.com/
- **Rete.js Docs:** https://rete.js.org/
- **ASP.NET Core:** https://docs.microsoft.com/aspnet/core/
- **Entity Framework:** https://docs.microsoft.com/ef/core/
- **Ready Player Me:** https://readyplayer.me/

---

**Ostatnia aktualizacja:** 2025-11-11
**Wersja:** 1.0.0
