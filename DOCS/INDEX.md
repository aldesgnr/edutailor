# 📑 INDEKS DOKUMENTACJI

## Szybka nawigacja po całej dokumentacji technicznej

---

## 🗂️ Struktura dokumentacji

```
DOCS/
├── README.md                      # ⭐ START TUTAJ - Wprowadzenie
├── INDEX.md                       # 📑 Ten plik - indeks nawigacyjny
├── ARCHITECTURE.md                # 🏗️ Architektura systemu
├── CODING-GUIDE.md                # 💻 Przewodnik kodowania
├── FILE-REFERENCE-FRONTEND.md     # 📁 Opis plików frontend
├── FILE-REFERENCE-BACKEND.md      # 📁 Opis plików backend
├── QUICK-REFERENCE.md             # ⚡ Snippety i szybka pomoc
├── IMPLEMENTATION-DETAILS.md      # 🔧 Szczegóły implementacyjne
├── DEVELOPMENT-PLAN.md            # 🎯 Plan rozwoju projektu
├── TESTING-STRATEGY.md            # 🧪 Strategia testowania
├── KNOWN-ISSUES.md                # 🐛 Znane problemy i rozwiązania
└── GLOSSARY.md                    # 📖 Słownik terminów
```

---

## 🎯 Dla kogo, która dokumentacja?

### **Nowy członek zespołu**
1. ⭐ [README.md](./README.md) - przegląd projektu
2. 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - zrozumienie architektury
3. 💻 [CODING-GUIDE.md](./CODING-GUIDE.md) - konwencje i wzorce
4. ⚡ [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - snippety pod ręką

### **Frontend Developer**
1. 📁 [FILE-REFERENCE-FRONTEND.md](./FILE-REFERENCE-FRONTEND.md) - szczegóły plików
2. 🔧 [IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md) - managers, 3D
3. ⚡ [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - React/TS snippety

### **Backend Developer**
1. 📁 [FILE-REFERENCE-BACKEND.md](./FILE-REFERENCE-BACKEND.md) - szczegóły plików
2. 🔧 [IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md) - auth flow, data sync
3. ⚡ [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - C#/EF snippety

### **DevOps / Deployment**
1. 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) → sekcja "Deployment Architecture"
2. ⭐ [README.md](./README.md) → sekcja "Szybki start"

### **Technical Lead / Architect**
1. 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - cała architektura
2. 🔧 [IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md) - szczegóły
3. 💻 [CODING-GUIDE.md](./CODING-GUIDE.md) - standardy zespołu
4. 🎯 [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md) - roadmap projektu
5. 🐛 [KNOWN-ISSUES.md](./KNOWN-ISSUES.md) - bieżące problemy

### **QA / Tester**
1. 🧪 [TESTING-STRATEGY.md](./TESTING-STRATEGY.md) - strategia testowania
2. 🐛 [KNOWN-ISSUES.md](./KNOWN-ISSUES.md) - znane bugi
3. 🎯 [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md) - co testować

### **Project Manager**
1. 🎯 [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md) - plan i timeline
2. 🐛 [KNOWN-ISSUES.md](./KNOWN-ISSUES.md) - status bugów
3. ⭐ [README.md](./README.md) - przegląd projektu

---

## 🔍 Znajdź informacje o...

### **React/Frontend**
- **Routing:** [FILE-REFERENCE-FRONTEND.md](./FILE-REFERENCE-FRONTEND.md#srcrouter) → `router.tsx`
- **Pages:** [FILE-REFERENCE-FRONTEND.md](./FILE-REFERENCE-FRONTEND.md#srcpages)
- **Components:** [FILE-REFERENCE-FRONTEND.md](./FILE-REFERENCE-FRONTEND.md#srccomponents)
- **Snippety:** [QUICK-REFERENCE.md](./QUICK-REFERENCE.md#react-component)

### **PlayCanvas/3D**
- **Managers:** [FILE-REFERENCE-FRONTEND.md](./FILE-REFERENCE-FRONTEND.md#srclib---biblioteki-3d)
- **EditorManager:** [IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md#managers-system)
- **Scene Loading:** [IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md#3d-scene-loading-pipeline)
- **Snippety:** [QUICK-REFERENCE.md](./QUICK-REFERENCE.md#playcanvas-snippets)

### **ScenarioEngine (Node Editor)**
- **Architecture:** [IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md#scenarioengine-deep-dive)
- **Nodes:** [FILE-REFERENCE-FRONTEND.md](./FILE-REFERENCE-FRONTEND.md#libscenarion-enginescenarion-enginets)
- **Dodawanie węzłów:** [CODING-GUIDE.md](./CODING-GUIDE.md#4-dodanie-nowego-typu-węzła-w-scenarioengine)

### **Backend/API**
- **Controllers:** [FILE-REFERENCE-BACKEND.md](./FILE-REFERENCE-BACKEND.md#modulesauth)
- **Models:** [FILE-REFERENCE-BACKEND.md](./FILE-REFERENCE-BACKEND.md#modelstrainingcs)
- **Authentication:** [IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md#authentication-flow)
- **Database:** [ARCHITECTURE.md](./ARCHITECTURE.md#database-schema)
- **Snippety:** [QUICK-REFERENCE.md](./QUICK-REFERENCE.md#controller-c)

### **Autentykacja/Autoryzacja**
- **JWT Flow:** [IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md#authentication-flow)
- **Login endpoint:** [FILE-REFERENCE-BACKEND.md](./FILE-REFERENCE-BACKEND.md#authcontrollercs)
- **Frontend auth:** [FILE-REFERENCE-FRONTEND.md](./FILE-REFERENCE-FRONTEND.md#servicesauthservicets)

### **Database/Entity Framework**
- **Schema:** [ARCHITECTURE.md](./ARCHITECTURE.md#database-schema)
- **Models:** [FILE-REFERENCE-BACKEND.md](./FILE-REFERENCE-BACKEND.md#modulesauth)
- **Migrations:** [CODING-GUIDE.md](./CODING-GUIDE.md#3-modyfikacja-bazy-danych)
- **Queries:** [QUICK-REFERENCE.md](./QUICK-REFERENCE.md#database-queries-ef-core)

### **Deployment**
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md#deployment-architecture)
- **Start Guide:** [README.md](./README.md#-szybki-start)
- **Environment:** [FILE-REFERENCE-FRONTEND.md](./FILE-REFERENCE-FRONTEND.md#env-sample--env)

### **Dodawanie funkcjonalności**
- **Step-by-step:** [CODING-GUIDE.md](./CODING-GUIDE.md#jak-dodać-nową-funkcjonalność)
- **Example:** [CODING-GUIDE.md](./CODING-GUIDE.md#przykład-dodanie-systemu-komentarzy-do-treningów)
- **Common Tasks:** [CODING-GUIDE.md](./CODING-GUIDE.md#najczęstsze-zadania)

### **Performance**
- **Optimization:** [IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md#performance-optimization)
- **Best Practices:** [CODING-GUIDE.md](./CODING-GUIDE.md#best-practices)

### **Debugging**
- **Guide:** [CODING-GUIDE.md](./CODING-GUIDE.md#debugging)
- **Console:** [QUICK-REFERENCE.md](./QUICK-REFERENCE.md#debugging)

---

## 📊 Mapowanie zadań → dokumentacja

| Zadanie | Dokumenty |
|---------|-----------|
| Dodać nową stronę | [CODING-GUIDE.md](./CODING-GUIDE.md#1-dodanie-nowej-strony), [QUICK-REFERENCE.md](./QUICK-REFERENCE.md#react-component) |
| Dodać API endpoint | [CODING-GUIDE.md](./CODING-GUIDE.md#2-dodanie-nowego-endpoint-api), [QUICK-REFERENCE.md](./QUICK-REFERENCE.md#controller-c) |
| Zmienić bazę danych | [CODING-GUIDE.md](./CODING-GUIDE.md#3-modyfikacja-bazy-danych), [FILE-REFERENCE-BACKEND.md](./FILE-REFERENCE-BACKEND.md#migrations) |
| Dodać node w edytorze | [CODING-GUIDE.md](./CODING-GUIDE.md#4-dodanie-nowego-typu-węzła-w-scenarioengine), [IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md#scenarioengine-deep-dive) |
| Dodać 3D manager | [CODING-GUIDE.md](./CODING-GUIDE.md#5-dodanie-nowego-managera-3d), [IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md#managers-system) |
| Debug problem | [CODING-GUIDE.md](./CODING-GUIDE.md#debugging), [README.md](./README.md#najczęstsze-problemy) |
| Deploy projekt | [ARCHITECTURE.md](./ARCHITECTURE.md#deployment-architecture), [README.md](./README.md#-szybki-start) |

---

## 🔑 Kluczowe koncepty

### **Managers Pattern**
- [ARCHITECTURE.md](./ARCHITECTURE.md) → "Manager Pattern"
- [IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md#managers-system)
- [CODING-GUIDE.md](./CODING-GUIDE.md#wzorce-projektowe) → "Manager Pattern"

### **Observable Pattern (RxJS)**
- [CODING-GUIDE.md](./CODING-GUIDE.md#wzorce-projektowe) → "Observer Pattern"
- [ARCHITECTURE.md](./ARCHITECTURE.md) → "Reactive State (RxJS)"
- [QUICK-REFERENCE.md](./QUICK-REFERENCE.md#manager-class)

### **DTO Pattern**
- [ARCHITECTURE.md](./ARCHITECTURE.md) → "DTO Pattern"
- [CODING-GUIDE.md](./CODING-GUIDE.md#wzorce-projektowe) → "DTO Pattern"
- [QUICK-REFERENCE.md](./QUICK-REFERENCE.md#entity-model)

### **Node-based Editor**
- [IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md#scenarioengine-deep-dive)
- [FILE-REFERENCE-FRONTEND.md](./FILE-REFERENCE-FRONTEND.md#libscenarion-engine)

---

## 🆘 Troubleshooting Index

| Problem | Rozwiązanie |
|---------|-------------|
| Frontend nie łączy się z API | [README.md](./README.md#najczęstsze-problemy) |
| Backend nie łączy się z bazą | [README.md](./README.md#najczęstsze-problemy) |
| Czarny ekran w edytorze 3D | [README.md](./README.md#najczęstsze-problemy), [TODO.MD](../TODO.MD) |
| Nie mogę się zalogować | [README.md](./README.md#najczęstsze-problemy) |
| Token expired | [IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md#authentication-flow) |
| Migration failed | [FILE-REFERENCE-BACKEND.md](./FILE-REFERENCE-BACKEND.md#migrations) |

---

## 📚 Quick Links

### **External Docs**
- [PlayCanvas Docs](https://developer.playcanvas.com/)
- [Rete.js Docs](https://rete.js.org/)
- [React Docs](https://react.dev/)
- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core/)
- [EF Core Docs](https://docs.microsoft.com/ef/core/)

### **Project Resources**
- **GitHub:** https://github.com/aldesgnr/edutailor
- **Website:** https://www.edutailor.ai
- **Production API:** https://185.201.114.251:5007
- **Static Server:** https://185.201.114.251:5008

---

## 📝 Aktualizacje dokumentacji

**Jak zaktualizować dokumentację:**
1. Edytuj odpowiedni plik w `/DOCS/`
2. Zaktualizuj datę "Ostatnia aktualizacja"
3. Jeśli dodajesz nową sekcję, dodaj link w tym indeksie
4. Commit: `docs: update [nazwa pliku]`

---

## ⭐ Zalecana kolejność czytania (dla nowych)

1. **[README.md](./README.md)** - Start here! 
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Zrozum system
3. **[CODING-GUIDE.md](./CODING-GUIDE.md)** - Naucz się konwencji
4. **[FILE-REFERENCE-FRONTEND.md](./FILE-REFERENCE-FRONTEND.md)** lub **[FILE-REFERENCE-BACKEND.md](./FILE-REFERENCE-BACKEND.md)** - Poznaj pliki
5. **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** - Bookmark for daily use
6. **[IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md)** - Deep dive when needed

---

**Wersja:** 1.0.0  
**Ostatnia aktualizacja:** 2025-11-11
