# 📖 SŁOWNIK TERMINÓW - GLOSSARY

Definicje kluczowych pojęć używanych w projekcie EduTailor.ai

---

## A

### **API Client**
Auto-generowany TypeScript kod na podstawie OpenAPI specification z backendu. Zapewnia type-safe dostęp do API z frontendu.

### **AppDBContext**
Entity Framework Core DbContext - główna klasa zarządzająca dostępem do bazy danych w backend.

### **Asset**
W kontekście PlayCanvas: zasób 3D (model, tekstura, animacja, dźwięk). W projekcie przechowywane w `bd-academy-static/`.

### **Avatar**
Postać 3D NPC (Non-Player Character) w scenach treningowych. Np. lekarz, pacjent, pielęgniarka. Modele z Ready Player Me.

---

## B

### **BehaviorSubject**
RxJS observable który przechowuje ostatnią wartość i emituje ją do nowych subscriberów. Używany w managers do reactive state.

### **Blocking (command)**
Komenda która czeka na zakończenie przed zwróceniem kontroli. Przeciwieństwo: non-blocking/async.

---

## C

### **Canvas**
Element HTML `<canvas>` na którym PlayCanvas renderuje grafikę 3D. Każdy manager (Editor/Viewer) ma własny canvas.

### **Claim**
W JWT: informacja o użytkowniku (email, role, userId). Używane w autentykacji.

### **ControlFlowEngine**
Silnik wykonywania node graph w Rete.js. Wykonuje węzły sekwencyjnie według połączeń.

### **CORS (Cross-Origin Resource Sharing)**
Mechanizm bezpieczeństwa przeglądarki. Backend musi zezwolić na requesty z frontendu (różne origins).

---

## D

### **Dialog**
Scenariusz konwersacyjny w formacie node graph. Zawiera NPCNode (wypowiedzi) i StatementNode (wybory gracza).

### **DTO (Data Transfer Object)**
Obiekt przenoszący dane między warstwami aplikacji. Separuje model bazodanowy od API response.

### **Draft**
Szkic treningu (status `Type = "DRAFT"`). Nie jest opublikowany dla użytkowników końcowych.

---

## E

### **Eager Loading**
W Entity Framework: wczytywanie powiązanych encji w jednym query (`.Include()`). Zapobiega N+1 problem.

### **EditorManager**
Manager odpowiedzialny za tryb edycji scen 3D. Dziedziczy z ViewerManager, dodaje transform controls i object selection.

### **Entity**
W PlayCanvas: obiekt w hierarchii sceny 3D. Ma position, rotation, scale i components (render, collision, etc.).

### **Entity Framework (EF Core)**
ORM (Object-Relational Mapper) dla .NET. Mapuje klasy C# na tabele SQL.

---

## F

### **Foreign Key**
Klucz obcy w bazie danych. Relacja między tabelami (np. `TrainingId` w `TrainingSection`).

---

## G

### **Gizmo**
Wizualna kontrolka w edytorze 3D do transformacji obiektów (translate/rotate/scale handles).

### **GLB**
Format pliku 3D (binary glTF). Zawiera modele, tekstury, animacje w jednym pliku.

---

## H

### **Hot Reload**
Automatyczne przeładowanie zmian w kodzie bez restartu aplikacji (Vite dev server).

---

## I

### **Interceptor**
W Axios: middleware który przechwytuje requesty/responses i modyfikuje je (np. dodaje JWT token).

### **InverseProperty**
Atrybut EF Core definiujący navigation property dla relacji (np. `[InverseProperty("Training")]`).

---

## J

### **JWT (JSON Web Token)**
Token autentykacji. Zawiera claims (email, role) i jest podpisany przez backend. Ważny 15 min (access token).

---

## L

### **Lazy Loading**
Ładowanie danych/kodu dopiero gdy jest potrzebne. W React: `lazy()`, w EF: automatic loading przy pierwszym dostępie.

### **LOD (Level of Detail)**
Technika optymalizacji: używanie uproszczonych modeli 3D dla odległych obiektów.

---

## M

### **Manager**
Singleton class odpowiedzialny za konkretny obszar funkcjonalności (CameraManager, SceneManager, etc.). Pattern używany w projekcie.

### **Migration**
W EF Core: plik opisujący zmianę schematu bazy danych (dodanie tabeli, kolumny, etc.).

### **Middleware**
W ASP.NET: komponent przetwarzający HTTP request/response (np. authentication, CORS).

---

## N

### **Node**
Węzeł w graph editorze (Rete.js). Reprezentuje krok w scenariuszu (StartNode, NPCNode, StatementNode, etc.).

### **NPC (Non-Player Character)**
Postać kontrolowana przez komputer (nie gracz). W projekcie: avatar w scenie (lekarz, pacjent).

---

## O

### **Observable**
RxJS pattern: stream danych który można subskrybować. Manager emituje zmiany state przez observables.

### **ORM (Object-Relational Mapper)**
Narzędzie mapujące obiekty programu na tabele bazy (Entity Framework Core).

### **Orbit Camera**
Kamera obracająca się wokół punktu centralnego. Używana w editor mode.

---

## P

### **PlayCanvas**
Open-source silnik 3D/WebGL używany w projekcie do renderowania scen.

### **Props**
Właściwości komponentu React. Przekazywane z parent do child component.

---

## Q

### **Query Params**
Parametry w URL po znaku `?` (np. `?trainingUUID=123`). Używane do przekazywania danych między stronami.

---

## R

### **Refresh Token**
Token do odświeżenia wygasłego access token. Ważny 7 dni. Przechowywany w localStorage.

### **Rete.js**
Framework do tworzenia node-based editorów. Używany w ScenarioEngine.

### **Rigidbody**
Component PlayCanvas dla fizyki. Typ: static (nieruchomy), dynamic (ruchomy), kinematic (kontrolowany skryptem).

### **Router**
React Router - system nawigacji między stronami SPA.

### **RxJS**
Biblioteka reactive programming. Używana do observable pattern w managers.

---

## S

### **Scenario**
Scenariusz dialogowy - graf węzłów definiujący przebieg konwersacji w treningu.

### **ScenarioEngine**
Manager zarządzający wykonywaniem scenariuszy (Rete.js editor + execution engine).

### **Scene**
Scena 3D - środowisko w którym odbywa się trening (gabinet lekarski, pokój, etc.).

### **Singleton**
Pattern: klasa ma tylko jedno instance w aplikacji. EditorManager i ViewerManager są singletons.

### **Socket**
W Rete.js: punkt połączenia między węzłami (input socket, output socket).

### **Soft Delete**
Usuwanie rekordu przez ustawienie `DeletedAt` zamiast fizycznego DELETE. Pozwala na przywrócenie.

### **Statement**
Wybór gracza w dialogu. StatementNode prezentuje opcje i czeka na selekcję.

---

## T

### **Training**
Główna encja systemu - trening składający się z sekcji i komponentów (sceny, dialogi, quizy).

### **TrainingSection**
Sekcja treningu - grupa komponentów (np. "Wprowadzenie", "Ćwiczenie 1").

### **TrainingSectionComponent**
Komponent sekcji - konkretny element treningu (SCENE, DIALOG, QUIZ, FILE).

### **Transform Controls**
Gizmo w edytorze 3D do manipulacji obiektami (translate, rotate, scale).

---

## U

### **useEffect**
React hook do side effects (API calls, subscriptions, event listeners). Cleanup w return function.

### **useState**
React hook do local state w functional component.

---

## V

### **ViewerManager**
Base manager dla odtwarzania treningów. EditorManager dziedziczy z niego.

### **Vite**
Build tool i dev server dla frontendu. Szybszy od Webpack.

---

## W

### **WebGL**
JavaScript API do renderowania 3D w przeglądarce. PlayCanvas używa WebGL.

### **WebXR**
API do Virtual Reality w przeglądarce. Projekt wspiera VR headsets.

---

## Przykłady użycia

### **Manager Pattern w praktyce:**
```typescript
// Singleton instance
const editorManager = new EditorManager()

// Observable state
editorManager.initialized.subscribe(isInit => {
  if (isInit) console.log('Editor ready')
})

// Public API
await editorManager.loadTrainingScene(uuid)
```

### **DTO Pattern w praktyce:**
```csharp
// Model (database)
public class Training {
  public Guid Id { get; set; }
  public List<TrainingSection> Sections { get; set; }
}

// DTO (API)
public class TrainingDTO {
  public Guid Id { get; set; }
  public List<TrainingSectionDTO> Sections { get; set; }
}

// Conversion
return training.toDTO();
```

### **Observable Pattern w praktyce:**
```typescript
// Manager emits
this.selectedObject.next(entity)

// Component subscribes
useEffect(() => {
  const sub = manager.selectedObject.subscribe(obj => {
    console.log('Selected:', obj)
  })
  return () => sub.unsubscribe() // Cleanup!
}, [])
```

---

## Akronimy

| Akronim | Pełna nazwa | Znaczenie |
|---------|-------------|-----------|
| API | Application Programming Interface | Interfejs do komunikacji między systemami |
| CORS | Cross-Origin Resource Sharing | Mechanizm bezpieczeństwa w przeglądarkach |
| CRUD | Create Read Update Delete | Podstawowe operacje na danych |
| DTO | Data Transfer Object | Obiekt przenoszący dane |
| EF | Entity Framework | ORM dla .NET |
| FPS | Frames Per Second | Liczba klatek na sekundę (performance) |
| GLB | GL Transmission Format Binary | Format plików 3D |
| JWT | JSON Web Token | Token autentykacji |
| LOD | Level of Detail | Poziom szczegółowości modelu 3D |
| NPC | Non-Player Character | Postać kontrolowana przez komputer |
| ORM | Object-Relational Mapper | Narzędzie mapujące obiekty na SQL |
| REST | Representational State Transfer | Styl architektury API |
| SPA | Single Page Application | Aplikacja jednostronicowa |
| VR | Virtual Reality | Wirtualna rzeczywistość |
| WebGL | Web Graphics Library | API grafiki 3D w przeglądarce |
| WebXR | Web Extended Reality | API VR/AR w przeglądarce |

---

**Ostatnia aktualizacja:** 2025-11-11
