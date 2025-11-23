# 🐛 ZNANE PROBLEMY I ROZWIĄZANIA

**Aktualna lista bugów, workaroundów i planowanych napraw**

---

## 🔴 CRITICAL - Wymaga natychmiastowej naprawy

### **#001: Czarny ekran po przełączeniu między edytorami**

**Priorytet:** 🔴 CRITICAL  
**Status:** ✅ FIXED (2025-11-23)  
**Zgłoszono:** TODO.MD (istniejący)  
**Dotyczy:** bd-academy (frontend)

**Opis problemu:**
Po przejściu z edytora dialogów (`/dialog`) do edytora scen (`/editor`) canvas pozostaje czarny. Scena nie renderuje się poprawnie.

**Root cause:**
Skrypty operujące na kamerze (outline helpers) nie są reinicjalizowane po powrocie do edytora scen. Metody `addHoveredObjectOutlineHelper` i `addSelectedObjectOutlineHelper` muszą być wykonane ponownie.

**Pliki do modyfikacji:**
- `bd-academy/src/lib/editor-manager/editor-manager.ts`
- `bd-academy/src/lib/script-manager/script-manager.ts`
- `bd-academy/src/pages/editor/editor.page.tsx`

**Proponowane rozwiązanie:**
```typescript
// EditorManager
public reinitializeOutlineHelpers() {
  if (!this.scriptManager.objectSelector) return
  
  // Clear existing helpers
  this.scriptManager.objectSelector.removeOutlineHelpers()
  
  // Re-add helpers
  this.scriptManager.objectSelector.addHoveredObjectOutlineHelper()
  this.scriptManager.objectSelector.addSelectedObjectOutlineHelper()
  
  console.log('[EditorManager] Outline helpers reinitialized')
}

// EditorPage - detect route change
useEffect(() => {
  if (location.pathname === '/editor' && editorManager.trainingSceneStarted.value) {
    editorManager.reinitializeOutlineHelpers()
  }
}, [location.pathname])
```

**Workaround:**
Refresh strony (F5) po powrocie do edytora.

**ETA:** 2025-11-12

---

## 🟡 HIGH - Wpływa na user experience

### **#002: Brak autosave w edytorze**

**Priorytet:** 🟡 HIGH  
**Status:** ✅ FIXED (2025-11-23)  
**Dotyczy:** bd-academy (frontend)

**Opis problemu:**
Użytkownik może stracić zmiany jeśli nie kliknie "Save" przed zamknięciem edytora lub crash'em przeglądarki.

**Rozwiązanie:**
Implementacja autosave co 30 sekund:
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    if (editorManager.editableSceneChanged.value) {
      await saveScene()
      showToast('Auto-saved', 'Changes saved automatically', 'info')
    }
  }, 30000)
  
  return () => clearInterval(interval)
}, [])
```

**ETA:** 2025-11-13

---

### **#003: Brak walidacji przed publikacją treningu**

**Priorytet:** 🟡 HIGH  
**Status:** ✅ FIXED (2025-11-23)  
**Dotyczy:** bd-academy (frontend + backend)

**Opis problemu:**
Użytkownik może opublikować niekompletny trening (bez sekcji, bez sceny, dialog bez Start/End nodes).

**Rozwiązanie:**
Backend endpoint `/api/Trainings/{id}/validate`:
```csharp
[HttpGet("{id}/validate")]
public async Task<ActionResult<ValidationResult>> ValidateTraining(Guid id)
{
  var training = await _context.Training
    .Include(t => t.TrainingSections)
      .ThenInclude(s => s.TrainingSectionComponents)
    .FirstOrDefaultAsync(t => t.Id == id);
  
  var errors = new List<string>();
  
  if (string.IsNullOrEmpty(training.Title))
    errors.Add("Title is required");
  
  if (!training.TrainingSections.Any())
    errors.Add("At least one section is required");
  
  foreach (var section in training.TrainingSections) {
    if (!section.TrainingSectionComponents.Any())
      errors.Add($"Section '{section.Title}' has no components");
  }
  
  return Ok(new ValidationResult { 
    IsValid = !errors.Any(), 
    Errors = errors 
  });
}
```

**ETA:** 2025-11-14

---

## 🟢 MEDIUM - Nice to have

### **#004: Brak search/filtering na liście treningów**

**Priorytet:** 🟢 MEDIUM  
**Status:** ✅ FIXED (2025-11-23)  
**Dotyczy:** bd-academy (frontend)

**Opis problemu:**
Przy dużej liczbie treningów trudno znaleźć konkretny. Brak możliwości filtrowania po typie, statusie, dacie.

**Rozwiązanie:**
```typescript
const [filters, setFilters] = useState({
  search: '',
  type: 'ALL',
  status: 'ALL'
})

const filteredTrainings = trainings.filter(t => {
  if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) {
    return false
  }
  if (filters.type !== 'ALL' && t.type !== filters.type) {
    return false
  }
  if (filters.status !== 'ALL' && (filters.status === 'PUBLISHED' ? !t.published : t.published)) {
    return false
  }
  return true
})
```

**ETA:** 2025-11-18

---

### **#005: Brak Undo/Redo w edytorze scen**

**Priorytet:** 🟢 MEDIUM  
**Status:** ✅ FIXED (2025-11-23)  
**Dotyczy:** bd-academy (frontend)

**Opis problemu:**
Jeśli użytkownik przypadkowo usunie obiekt lub zmieni pozycję, nie może cofnąć operacji.

**Rozwiązanie:**
History stack w EditorManager:
```typescript
class EditorManager {
  private history: SceneState[] = []
  private historyIndex = -1
  private maxHistory = 50
  
  public recordState() {
    const state = this.exportSceneState()
    
    // Remove future states if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1)
    }
    
    this.history.push(state)
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    } else {
      this.historyIndex++
    }
  }
  
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

// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      editorManager.undo()
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault()
      editorManager.redo()
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

**ETA:** 2025-11-20

---

## 🔵 LOW - Minor issues

### **#006: Brak tooltips w edytorze**

**Priorytet:** 🔵 LOW  
**Status:** ✅ FIXED (2025-11-23)  
**Dotyczy:** bd-academy (frontend)

**Opis problemu:**
Nowi użytkownicy nie wiedzą do czego służą przyciski w edytorze (translate/rotate/scale).

**Rozwiązanie:**
PrimeReact Tooltip:
```typescript
import { Tooltip } from 'primereact/tooltip'

<>
  <Tooltip target=".translate-btn" content="Translate mode (T)" position="bottom" />
  <Tooltip target=".rotate-btn" content="Rotate mode (R)" position="bottom" />
  <Tooltip target=".scale-btn" content="Scale mode (S)" position="bottom" />
  
  <Button className="translate-btn" onClick={...} />
  <Button className="rotate-btn" onClick={...} />
  <Button className="scale-btn" onClick={...} />
</>
```

**ETA:** 2025-11-22

---

### **#007: Performance issues z dużymi scenami**

**Priorytet:** 🔵 LOW  
**Status:** 🔍 INVESTIGATING  
**Dotyczy:** bd-academy (frontend - PlayCanvas)

**Opis problemu:**
Sceny z wieloma obiektami (>100) powodują spadek FPS poniżej 30.

**Możliwe przyczyny:**
1. Brak frustum culling
2. Wszystkie obiekty castują shadows
3. Zbyt wysoka rozdzielczość tekstur

**Testy do wykonania:**
```typescript
// Test 1: Disable shadows
entity.render.castShadows = false
entity.render.receiveShadows = false

// Test 2: Enable frustum culling
entity.render.cullMode = pc.CULLFACE_BACK

// Test 3: LOD levels
const distance = camera.getPosition().distance(entity.getPosition())
if (distance > 50) {
  entity.enabled = false // Cull completely
}
```

**ETA:** TBD (wymaga dalszej analizy)

---

### **#008: Bulk Operations**

**Priorytet:** 🟢 MEDIUM  
**Status:** ✅ FIXED (2025-11-23)  
**Dotyczy:** bd-academy (frontend)

**Opis problemu:**
Brak możliwości zaznaczenia wielu treningów i wykonania operacji zbiorczych (np. usunięcie).

**Rozwiązanie:**
```typescript
const [bulkMode, setBulkMode] = useState(false)
const [selectedTrainings, setSelectedTrainings] = useState<Set<string>>(new Set())

const bulkDelete = () => {
  confirmDialog({
    message: `Delete ${selectedTrainings.size} training(s)?`,
    accept: async () => {
      await Promise.all(Array.from(selectedTrainings).map(id => 
        fetch(`/api/Trainings/${id}`, { method: 'DELETE' })
      ))
      setSelectedTrainings(new Set())
      setBulkMode(false)
      refreshTrainings()
    }
  })
}
```

**ETA:** ✅ DONE

---

### **#009: Error Handling & Loading States**

**Priorytet:** 🟢 MEDIUM  
**Status:** ✅ FIXED (2025-11-23)  
**Dotyczy:** bd-academy (frontend)

**Opis problemu:**
Brak informacji zwrotnej podczas ładowania danych i obsługi błędów.

**Rozwiązanie:**
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const refreshTrainings = async () => {
  setLoading(true)
  setError(null)
  try {
    const response = await TrainingService.getTrainings()
    setTrainings(response.data)
  } catch (err) {
    setError('Failed to load trainings')
    GlobalToast.toastShow?.('Error', 'Failed to load', 'error')
  } finally {
    setLoading(false)
  }
}
```

**ETA:** ✅ DONE

---

## 📊 Statystyki

**Total Issues:** 9  
**Fixed:** 8 ✅ (#001-#006, #008, #009)  
**Critical:** 0 🔴  
**High:** 0 🟡  
**Medium:** 0 🟢  
**Low:** 1 🔵  

**By Status:**
- Fixed: 8 ✅ (89%)
- Planned: 0
- Investigating: 1 (11%)

**Today's Fixes (2025-11-23):**
- ✅ #001: Black screen bug
- ✅ #002: Autosave system
- ✅ #003: Validation before publish
- ✅ #004: Search & filtering
- ✅ #005: Undo/Redo
- ✅ #006: Tooltips
- ✅ #008: Bulk operations
- ✅ #009: Error handling & loading states

**Remaining:**
- 🔍 #007: Performance issues (investigating)

---

## 🔧 Jak zgłosić nowy problem?

1. Dodaj sekcję w tym pliku
2. Użyj formatu:
```markdown
### **#XXX: Krótki opis problemu**

**Priorytet:** 🔴/🟡/🟢/🔵  
**Status:** 📋 PLANNED / 🔧 IN PROGRESS / 🔍 INVESTIGATING  
**Dotyczy:** moduł (frontend/backend/static)

**Opis problemu:**
Szczegółowy opis

**Rozwiązanie:**
Proponowane rozwiązanie z kodem

**ETA:** Data
```

3. Update statystyki
4. Commit z opisem: `docs: add known issue #XXX`

---

## ✅ Rozwiązane problemy (Archive)

### **#000: Example resolved issue**
**Rozwiązano:** 2025-11-10  
**Opis:** Przykładowy problem który został naprawiony  
**Pull Request:** #123

---

**Ostatnia aktualizacja:** 2025-11-23 18:50  
**Następny review:** 2025-11-30  
**Status:** 🟢 **EXCELLENT** (89% issues fixed)
