# 🎯 PLAN ROZWOJU - EDUTAILOR.AI

**Praktyczny przewodnik rozwoju projektu z priorytetami i konkretnymi zadaniami**

---

## 🔥 PILNE - Do naprawienia TERAZ

### **🐛 Critical Bug: Czarny ekran po przełączeniu między edytorami**
**Lokalizacja:** Editor → Dialog → powrót do Editor

**Problem:**
Po przejściu między edytorem skryptów a sceną pozostaje czarny ekran. Związane z ponownym dodawaniem skryptów operujących na kamerze.

**Metody do naprawienia:**
- `addHoveredObjectOutlineHelper`
- `addSelectedObjectOutlineHelper`

**Trzeba je ponownie wykonać po przejściu na edytor sceny.**

**Pliki do sprawdzenia:**
- `bd-academy/src/lib/editor-manager/editor-manager.ts`
- `bd-academy/src/lib/object-selector/object-outline-helper.ts`
- `bd-academy/src/pages/editor/editor.page.tsx`
- `bd-academy/src/pages/dialog/dialog.page.tsx`

**Plan naprawy:**
```typescript
// W EditorManager
public reInitializeOutlineHelpers() {
  if (this.scriptManager.objectSelector) {
    this.scriptManager.objectSelector.addHoveredObjectOutlineHelper()
    this.scriptManager.objectSelector.addSelectedObjectOutlineHelper()
  }
}

// W EditorPage - useEffect po powrocie z dialog
useEffect(() => {
  if (editorManager.trainingSceneStarted.value) {
    editorManager.reInitializeOutlineHelpers()
  }
}, [location.pathname])
```

**Status:** 🔴 **CRITICAL - Do naprawienia w pierwszej kolejności**

---

## 📋 PRIORYTET 1: Stabilizacja core funkcjonalności

### **1.1 System autosave (30min)**
**Cel:** Automatyczne zapisywanie zmian co 30s w edytorze

**Implementacja:**
```typescript
// bd-academy/src/pages/editor/editor.page.tsx
useEffect(() => {
  const interval = setInterval(() => {
    if (editorManager.editableSceneChanged.value) {
      saveScene()
    }
  }, 30000)
  
  return () => clearInterval(interval)
}, [])
```

**Pliki:**
- `bd-academy/src/pages/editor/editor.page.tsx`
- `bd-academy/src/services/training.service.ts` (dodać endpoint save)

### **1.2 Undo/Redo w edytorze (2h)**
**Cel:** Historia zmian w edytorze scen

**Implementacja:**
```typescript
class EditorManager {
  private history: SceneState[] = []
  private historyIndex: number = -1
  
  public undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--
      this.restoreState(this.history[this.historyIndex])
    }
  }
  
  public redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++
      this.restoreState(this.history[this.historyIndex])
    }
  }
}
```

**Pliki:**
- `bd-academy/src/lib/editor-manager/editor-manager.ts`
- Dodać keyboard shortcuts (Ctrl+Z, Ctrl+Y)

### **1.3 Validation przed publish (1h)**
**Cel:** Sprawdzenie czy trening jest kompletny przed publikacją

**Walidacja:**
- ✅ Trening ma tytuł i opis
- ✅ Przynajmniej jedna sekcja
- ✅ Każda sekcja typu SCENE ma scenę
- ✅ Każda sekcja typu DIALOG ma dialog z Start i End node
- ✅ Brak orphaned nodes w dialogu

**Pliki:**
- `bd-academy/src/services/training.service.ts`
- `bd-academy-backend/Modules/Training/Controllers/TrainingsController.cs` (endpoint validate)

---

## 📋 PRIORYTET 2: User Experience

### **2.1 Search i filtrowanie treningów (1.5h)**
**Lokalizacja:** Dashboard, Training List

**Features:**
- Search by title/description
- Filter by type (VR/SCENE/QUIZ)
- Filter by status (DRAFT/PUBLISHED)
- Sort by date/title

**Pliki:**
- `bd-academy/src/pages/dashboard/dashboard.page.tsx`
- `bd-academy/src/pages/training/training.page.tsx`

### **2.2 Bulk operations (2h)**
**Funkcje:**
- Multi-select treningów
- Bulk delete
- Bulk publish/unpublish
- Bulk favorite

**Pliki:**
- `bd-academy/src/components/training/training-list.component.tsx` (nowy)
- Backend: batch endpoints

### **2.3 Tooltips i help system (1h)**
**Cel:** Wyjaśnienie UI elementów dla nowych użytkowników

**Implementacja:**
```typescript
import { Tooltip } from 'primereact/tooltip'

<Tooltip target=".transform-btn" content="Translate mode (T)" />
<Button className="transform-btn" onClick={...} />
```

**Pliki:**
- Wszystkie komponenty edytora
- `bd-academy/src/components/common/help-tooltip.component.tsx` (nowy)

---

## 📋 PRIORYTET 3: Performance

### **3.1 Lazy loading scen (2h)**
**Cel:** Nie ładować wszystkich scen od razu, tylko on-demand

**Przed:**
```typescript
// Wszystkie sceny ładowane przy starcie
possibleScenes.forEach(scene => loadScene(scene.url))
```

**Po:**
```typescript
// Ładowanie tylko wybranej sceny
onSceneSelect(sceneId) {
  const scene = possibleScenes.find(s => s.id === sceneId)
  loadScene(scene.url)
}
```

### **3.2 Image optimization (1h)**
**Cel:** Thumbnails treningów w niskiej rozdzielczości

**Implementacja:**
- Backend endpoint do resize'owania obrazów
- CDN dla statycznych assetów
- WebP format zamiast PNG/JPG

### **3.3 Code splitting (1h)**
**Cel:** Mniejsze bundle size

```typescript
// Lazy load heavy dependencies
const PlayCanvasEditor = lazy(() => import('./components/editor/editor.component'))
const ReteEditor = lazy(() => import('./components/dialog/dialog.component'))
```

---

## 📋 PRIORYTET 4: Nowe funkcjonalności

### **4.1 System komentarzy (3h)**
**Opis:** Komentarze do treningów (feedback od użytkowników)

**Backend:**
```csharp
public class TrainingComment {
  public Guid Id { get; set; }
  public Guid TrainingId { get; set; }
  public string UserId { get; set; }
  public string Comment { get; set; }
  public DateTime CreatedAt { get; set; }
}
```

**Frontend:**
```typescript
// Komponent komentarzy pod treningiem
<TrainingComments trainingId={id} />
```

### **4.2 Analytics/Statistics (4h)**
**Metryki:**
- Liczba odtworzeń treningu
- Średni czas ukończenia
- Popularność poszczególnych wyborów w dialogach
- Drop-off points

**Backend:**
```csharp
public class TrainingAnalytics {
  public Guid TrainingId { get; set; }
  public int ViewCount { get; set; }
  public double AverageCompletionTime { get; set; }
  public Dictionary<string, int> ChoiceStats { get; set; }
}
```

### **4.3 Collaboration features (5h)**
**Funkcje:**
- Współdzielenie treningu z innymi użytkownikami
- Role: Owner, Editor, Viewer
- Real-time collaboration (optional - WebSockets)

**Backend:**
```csharp
public class TrainingCollaborator {
  public Guid TrainingId { get; set; }
  public string UserId { get; set; }
  public string Role { get; set; } // Owner, Editor, Viewer
}
```

### **4.4 Templates system (3h)**
**Cel:** Pre-made templates dla typowych scenariuszy

**Templates:**
- "Breaking bad news" (medycyna)
- "Sales pitch" (biznes)
- "Job interview" (HR)
- "Customer complaint" (customer service)

**Struktura:**
```json
{
  "id": "template-001",
  "name": "Breaking Bad News",
  "description": "Medical scenario template",
  "scene": "doctor_clinic",
  "avatars": [
    { "type": "doctor", "position": [0, 0, 0] },
    { "type": "patient", "position": [1, 0, 2] }
  ],
  "dialogTemplate": { /* Rete.js graph */ }
}
```

---

## 📋 PRIORYTET 5: DevOps i Testing

### **5.1 Unit tests (4h)**
**Frontend:**
```typescript
// Services tests
describe('TrainingService', () => {
  it('should fetch trainings', async () => {
    const trainings = await TrainingService.getTrainings()
    expect(trainings).toBeDefined()
  })
})

// Component tests
describe('TrainingCard', () => {
  it('renders training title', () => {
    render(<TrainingCard training={mockTraining} />)
    expect(screen.getByText('Test Training')).toBeInTheDocument()
  })
})
```

**Backend:**
```csharp
[Fact]
public async Task GetTraining_ReturnsTraining_WhenExists()
{
    // Arrange
    var controller = new TrainingsController(mockContext);
    
    // Act
    var result = await controller.GetTraining(testId);
    
    // Assert
    Assert.IsType<OkObjectResult>(result.Result);
}
```

### **5.2 E2E tests (5h)**
**Playwright scenarios:**
```typescript
test('Create and publish training', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('text=New Training')
  await page.fill('#title', 'Test Training')
  await page.click('text=Save')
  await page.click('text=Publish')
  expect(await page.textContent('.status')).toBe('Published')
})
```

### **5.3 CI/CD Pipeline (3h)**
**GitHub Actions:**
```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build
  
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: dotnet restore
      - run: dotnet test
      - run: dotnet build
```

### **5.4 Docker Compose dla dev (2h)**
```yaml
version: '3.8'
services:
  frontend:
    build: ./bd-academy
    ports: ["5173:5173"]
    volumes: ["./bd-academy:/app"]
  
  backend:
    build: ./bd-academy-backend
    ports: ["5007:5007"]
    depends_on: [mysql]
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: academy
```

---

## 📋 PRIORYTET 6: Documentation i Maintenance

### **6.1 API Documentation (2h)**
**Swagger improvement:**
- Dodać przykłady request/response
- Dodać opisów endpoints
- Wygenerować Postman collection

### **6.2 Video tutorials (4h)**
**Nagrania:**
- "Jak stworzyć pierwszy trening"
- "Edytor scen 3D - tutorial"
- "Tworzenie dialogów - tutorial"
- "Publikowanie i udostępnianie"

### **6.3 Error tracking (2h)**
**Sentry integration:**
```typescript
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0
})
```

---

## 🎯 Timeline (2 miesiące)

### **Tydzień 1-2: Stabilizacja**
- ✅ Fix czarny ekran bug
- ✅ Autosave system
- ✅ Validation przed publish
- ✅ Undo/Redo

### **Tydzień 3-4: UX improvements**
- ✅ Search i filtering
- ✅ Bulk operations
- ✅ Tooltips/Help
- ✅ Performance optimization

### **Tydzień 5-6: Nowe features**
- ✅ System komentarzy
- ✅ Analytics
- ✅ Templates

### **Tydzień 7-8: Testing i DevOps**
- ✅ Unit tests
- ✅ E2E tests
- ✅ CI/CD
- ✅ Docker setup

---

## 📊 Metryki sukcesu

### **Performance:**
- Time to Interactive < 3s
- First Contentful Paint < 1.5s
- Bundle size < 2MB (gzipped)
- FPS w edytorze 3D > 30

### **Quality:**
- Test coverage > 70%
- Zero critical bugs
- < 5 known bugs (non-critical)

### **User Satisfaction:**
- Completion rate treningów > 80%
- Average session time > 15 min
- Return rate > 60%

---

## 🚀 Quick Start (dla developera)

### **Dzisiaj (2h):**
1. ✅ **Fix czarny ekran** - 30 min
2. ✅ **Dodaj autosave** - 30 min
3. ✅ **Dodaj validation** - 1h

### **Ten tydzień:**
1. Undo/Redo
2. Search/filtering
3. Unit tests dla kluczowych komponentów

### **Ten miesiąc:**
1. Wszystkie PRIORYTET 1 i 2
2. Rozpocząć PRIORYTET 3
3. Setup CI/CD

---

## 📝 Daily Checklist

**Przed rozpoczęciem pracy:**
- [ ] Pull latest changes z GitHub
- [ ] Sprawdź KNOWN-ISSUES.md
- [ ] Wybierz zadanie z tego planu

**Podczas pracy:**
- [ ] Pisz testy dla nowego kodu
- [ ] Dokumentuj zmiany w CHANGELOG.md
- [ ] Commit często z dobrymi messages

**Po zakończeniu:**
- [ ] Run wszystkie testy
- [ ] Update DEVELOPMENT-PLAN.md (status zadań)
- [ ] Push changes
- [ ] Update dokumentacji jeśli trzeba

---

**Ostatnia aktualizacja:** 2025-11-11  
**Następny review:** 2025-11-18
