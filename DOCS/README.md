# 📚 DOKUMENTACJA TECHNICZNA - EDUTAILOR.AI

Witaj w kompleksowej dokumentacji technicznej projektu **EduTailor.ai** (wcześniej ILMS - Interactive Learning Management System).

---

## 📖 Spis dokumentów

### 1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** 🏗️
**Architektura systemu**

Kompleksowy przegląd architektury projektu:
- Przegląd wysokopoziomowy
- Moduły projektu (frontend, backend, static)
- Flow danych
- Diagramy
- Database schema
- Deployment architecture
- Wzorce projektowe

**Dla kogo:** Programiści rozpoczynający pracę z projektem, architekci, team leaders

---

### 2. **[CODING-GUIDE.md](./CODING-GUIDE.md)** 💻
**Przewodnik kodowania**

Praktyczny przewodnik dla programistów:
- Konwencje nazewnictwa
- Wzorce projektowe
- Jak dodać nową funkcjonalność (step-by-step)
- Najczęstsze zadania
- Best practices
- Debugging
- Testowanie

**Dla kogo:** Wszyscy programiści pracujący z kodem

---

### 3. **[FILE-REFERENCE-FRONTEND.md](./FILE-REFERENCE-FRONTEND.md)** 📁
**Szczegółowy opis plików - Frontend**

Dokładny opis każdego kluczowego pliku w projekcie frontend:
- Pliki konfiguracyjne (vite.config.ts, tsconfig.json)
- Routing (router.tsx)
- Pages (dashboard, editor, viewer, dialog)
- Components (editor, viewer, training)
- Managers 3D (EditorManager, ViewerManager, ScenarioEngine)
- Services (API calls)
- Contexts (React Context providers)

**Dla kogo:** Frontend developers, osoby modyfikujące UI/3D

---

### 4. **[FILE-REFERENCE-BACKEND.md](./FILE-REFERENCE-BACKEND.md)** 📁
**Szczegółowy opis plików - Backend**

Dokładny opis struktury backend C#/.NET:
- Program.cs (entry point)
- AppDBContext.cs (EF Core)
- Modules (Auth, Training, User)
- Controllers (REST API endpoints)
- Models (Entity Framework)
- DTOs (Data Transfer Objects)
- Migrations
- API Client generation

**Dla kogo:** Backend developers, database administrators

---

### 5. **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** ⚡
**Szybka pomoc i snippety**

Kolekcja gotowych snippetów kodu:
- React components
- Manager classes
- API services
- Controllers (C#)
- Entity models
- PlayCanvas snippets
- Utility functions
- CSS patterns
- Database queries
- Error handling

**Dla kogo:** Wszyscy - quick reference podczas kodowania

---

### 6. **[IMPLEMENTATION-DETAILS.md](./IMPLEMENTATION-DETAILS.md)** 🔧
**Szczegóły implementacyjne**

Dogłębna analiza mechanizmów:
- Managers System (inicjalizacja, zależności)
- ScenarioEngine Deep Dive
- 3D Scene Loading Pipeline
- Authentication Flow (JWT)
- Data Synchronization
- Performance Optimization

**Dla kogo:** Senior developers, osoby debugujące complex issues

---

### 7. **[DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md)** 🎯
**Plan rozwoju projektu**

Praktyczny roadmap z priorytetami:
- Pilne bugi do naprawienia
- Priorytetyzowane zadania (P1-P6)
- Timeline (8 tygodni)
- Metryki sukcesu
- Daily checklist
- Quick start tasks

**Dla kogo:** Wszyscy - określa co robić i kiedy

---

### 8. **[TESTING-STRATEGY.md](./TESTING-STRATEGY.md)** 🧪
**Strategia testowania**

Kompletny plan testów:
- Unit tests (70%)
- Integration tests (20%)
- E2E tests (10%)
- Performance benchmarks
- Manual testing checklist
- Test coverage goals
- Tools setup

**Dla kogo:** QA, developers piszący testy, CI/CD setup

---

### 9. **[KNOWN-ISSUES.md](./KNOWN-ISSUES.md)** 🐛
**Znane problemy i rozwiązania**

Aktualna lista bugów:
- Critical issues z priorytetami
- Root cause analysis
- Proponowane rozwiązania (z kodem)
- Workaroundy
- ETA napraw
- Statystyki

**Dla kogo:** Wszyscy - przed rozpoczęciem pracy, podczas debugowania

---

### 10. **[GLOSSARY.md](./GLOSSARY.md)** 📖
**Słownik terminów**

Definicje kluczowych pojęć:
- Terminy techniczne (Manager, Observable, DTO, etc.)
- Akronimy (JWT, CORS, ORM, etc.)
- Przykłady użycia
- Context specyficzny dla projektu

**Dla kogo:** Wszyscy - szczególnie nowi członkowie zespołu

---

## 🚀 Szybki start

### **1. Pierwsze kroki**
1. Przeczytaj **ARCHITECTURE.md** - zrozumienie całości systemu
2. Zapoznaj się z **CODING-GUIDE.md** - konwencje i wzorce
3. Miej otwarte **QUICK-REFERENCE.md** - snippety pod ręką

### **2. Rozpoczęcie pracy**
```bash
# Sklonuj repo (już zrobione)
git clone https://github.com/aldesgnr/edutailor.git

# Frontend
cd bd-academy
npm install
cp .env-sample .env  # Edytuj zmienne
npm run dev

# Backend
cd bd-academy-backend/bd-academy-backend
# Skonfiguruj appsettings.json (database, JWT)
dotnet ef database update
dotnet run

# Static server
cd bd-academy-static
npm install
npm start
```

### **3. Środowisko deweloperskie**
- **IDE:** Visual Studio Code (frontend) + Visual Studio 2022 (backend)
- **Node.js:** v18+
- **.NET:** 7.0
- **MySQL:** 8.0+
- **Docker:** Opcjonalnie dla backend

---

## 📋 Kluczowe informacje

### **Technologie**

**Frontend:**
- React 18 + TypeScript
- PlayCanvas Engine (3D)
- Rete.js (node editor)
- PrimeReact + TailwindCSS
- Axios + RxJS

**Backend:**
- ASP.NET Core 7.0
- Entity Framework Core
- MySQL (Pomelo)
- JWT Authentication
- Swagger/OpenAPI

**Static:**
- Node.js
- http-server
- GLB models (3D assets)

---

### **Struktura projektu**
```
ilms/
├── bd-academy/                # Frontend (React + PlayCanvas)
│   ├── src/
│   │   ├── pages/            # Strony aplikacji
│   │   ├── components/       # Komponenty React
│   │   ├── lib/              # 3D Managers
│   │   ├── services/         # API calls
│   │   └── contexts/         # React Contexts
│   └── package.json
│
├── bd-academy-backend/        # Backend (.NET + MySQL)
│   ├── bd-academy-backend/
│   │   ├── Modules/
│   │   │   ├── Auth/         # Autentykacja
│   │   │   ├── Training/     # CRUD treningów
│   │   │   └── User/         # Zarządzanie użytkownikami
│   │   ├── AppDBContext.cs   # EF Core DbContext
│   │   └── Program.cs        # Entry point
│   └── bd-academy-backend.sln
│
├── bd-academy-static/         # Static file server
│   ├── static/
│   │   └── common/
│   │       ├── scenes/       # Sceny GLB
│   │       ├── avatar/       # Postacie
│   │       ├── animations/   # Animacje
│   │       └── editor-configuration.json
│   └── index.js
│
└── DOCS/                      # Ta dokumentacja
    ├── ARCHITECTURE.md
    ├── CODING-GUIDE.md
    ├── FILE-REFERENCE-FRONTEND.md
    ├── FILE-REFERENCE-BACKEND.md
    ├── QUICK-REFERENCE.md
    └── README.md (ten plik)
```

---

## 🎯 Typowe scenariusze

### **Dodanie nowej funkcjonalności**
1. Przeczytaj sekcję "Jak dodać nową funkcjonalność" w **CODING-GUIDE.md**
2. Backend: Dodaj model → DTO → Controller → Migration
3. Regeneruj API client: `./generate-api-clients.ps1`
4. Frontend: Dodaj service → component → page → routing
5. Testuj

### **Debugowanie problemu**
1. Sprawdź console (Chrome DevTools)
2. Sprawdź Network tab (API calls)
3. Backend: Sprawdź logi w konsoli
4. Użyj breakpointów (debugger / Visual Studio)
5. Zobacz sekcję "Debugging" w **CODING-GUIDE.md**

### **Modyfikacja UI**
1. Znajdź komponent w **FILE-REFERENCE-FRONTEND.md**
2. Edytuj plik .tsx
3. Użyj TailwindCSS classes lub styled-components
4. Hot reload pokaże zmiany natychmiast

### **Zmiana bazy danych**
1. Edytuj Entity model w `Modules/*/Models/`
2. Stwórz migrację: `dotnet ef migrations add MigrationName`
3. Zastosuj: `dotnet ef database update`
4. Zaktualizuj DTO i Controller jeśli potrzeba
5. Regeneruj API client

---

## 📞 Pomoc i wsparcie

### **Najczęstsze problemy**

**Problem:** Frontend nie może połączyć się z API
- Sprawdź `.env` - czy `VITE_BD_ACADEMY_API_URL` jest poprawny
- Sprawdź CORS w backend (Program.cs)
- Sprawdź czy backend działa: `https://localhost:5007/swagger`

**Problem:** Backend nie może połączyć się z bazą
- Sprawdź `appsettings.json` - credentials do MySQL
- Sprawdź czy MySQL działa: `mysql -u root -p`
- Zastosuj migrations: `dotnet ef database update`

**Problem:** Czarny ekran w edytorze 3D
- Zobacz TODO.MD - znany problem z camera scripts
- Sprawdź console - błędy PlayCanvas
- Verify że scena się załadowała: sprawdź Network tab

**Problem:** Nie mogę się zalogować
- Sprawdź czy backend działa
- Sprawdź czy admin został stworzony (DataProvider)
- Default credentials mogą być w seed data

---

## 🔄 Workflow rozwoju

### **Git Flow**
```bash
# Nowa funkcjonalność
git checkout -b feature/my-feature
# Koduj...
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
# Pull Request na GitHub

# Bugfix
git checkout -b fix/bug-description
# Napraw...
git commit -m "fix: resolve bug description"
git push origin fix/bug-description
```

### **Commit Messages**
```
feat: dodaje nową funkcjonalność
fix: naprawia bug
docs: aktualizuje dokumentację
style: formatowanie kodu
refactor: refaktoryzacja bez zmian funkcjonalności
test: dodaje testy
chore: zadania maintenance (dependencies, config)
```

---

## 📚 Dodatkowe zasoby

### **Dokumentacja zewnętrzna**
- [PlayCanvas Developer Docs](https://developer.playcanvas.com/)
- [Rete.js Documentation](https://rete.js.org/)
- [React Documentation](https://react.dev/)
- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core/)
- [Entity Framework Core](https://docs.microsoft.com/ef/core/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [PrimeReact](https://primereact.org/)

### **Tutoriale**
- PlayCanvas: https://developer.playcanvas.com/tutorials/
- React + TypeScript: https://react-typescript-cheatsheet.netlify.app/
- EF Core Migrations: https://docs.microsoft.com/ef/core/managing-schemas/migrations/

---

## 🤝 Kontrybucja

Jeśli dodajesz nową funkcjonalność lub naprawiasz bug:

1. Zaktualizuj odpowiednią dokumentację w `/DOCS/`
2. Dodaj komentarze w kodzie
3. Napisz testy (jeśli możliwe)
4. Zaktualizuj CHANGELOG (jeśli istnieje)
5. Utwórz Pull Request z opisem zmian

---

## 📝 Aktualizacja dokumentacji

**Kiedy aktualizować:**
- Dodajesz nowy moduł/manager
- Zmieniasz architekturę
- Dodajesz nowy endpoint API
- Zmieniasz database schema
- Wprowadzasz breaking changes

**Jak aktualizować:**
1. Edytuj odpowiedni plik w `/DOCS/`
2. Zaktualizuj datę "Ostatnia aktualizacja" na końcu pliku
3. Commit z opisem: `docs: update [nazwa pliku]`

---

## ⚖️ Licencja

Projekt własnością: **www.edutailor.ai**

---

## 📧 Kontakt

- **GitHub:** https://github.com/aldesgnr/edutailor
- **Website:** https://www.edutailor.ai

---

**Wersja dokumentacji:** 1.0.0  
**Ostatnia aktualizacja:** 2025-11-11  
**Autorzy:** Development Team

---

## 🎉 Rozpocznij przygodę!

Masz teraz wszystkie narzędzia potrzebne do skutecznej pracy z projektem EduTailor.ai.

**Powodzenia! 🚀**
