# 👥 ROLE UŻYTKOWNIKÓW - System 3 Kont

## 📋 Przegląd

System EduTailor.ai wspiera **3 typy kont** z różnymi uprawnieniami:

1. **Administrator** - pełna kontrola nad systemem
2. **Creator (Twórca Kursów)** - tworzenie i zarządzanie treningami
3. **Participant (Uczestnik)** - uczestnictwo w szkoleniach

---

## 1️⃣ ADMINISTRATOR

### **Uprawnienia:**
✅ Pełny dostęp do wszystkich funkcji  
✅ Zarządzanie użytkownikami (dodawanie, usuwanie, edycja)  
✅ Zarządzanie firmami/organizacjami  
✅ Dostęp do wszystkich treningów  
✅ Statystyki i raporty globalne  
✅ Konfiguracja systemu  
✅ Zarządzanie rolami i uprawnieniami  

### **Dostęp do:**
- `/admin` - Panel administracyjny
- `/dashboard` - Dashboard
- `/users` - Zarządzanie użytkownikami
- `/companies` - Zarządzanie firmami
- `/trainings` - Wszystkie treningi
- `/reports` - Raporty i statystyki
- `/settings` - Ustawienia systemu

### **Dane w bazie:**
```csharp
// AspNetRoles
Role: "ADMIN"

// AspNetUsers
User {
    Email: "admin@admin.pl",
    UserName: "Admin",
    Roles: ["ADMIN"]
}
```

### **Przykładowe konto:**
```
Email: admin@admin.pl
Password: mju7&UJM
Role: ADMIN
```

---

## 2️⃣ CREATOR (Twórca Kursów)

### **Uprawnienia:**
✅ Tworzenie nowych treningów  
✅ Edycja własnych treningów  
✅ Publikowanie/unpublishing treningów  
✅ Zarządzanie scenami 3D  
✅ Tworzenie dialogów i scenariuszy  
✅ Dostęp do edytora 3D  
✅ Dostęp do edytora dialogów  
✅ Statystyki własnych treningów  
✅ Zarządzanie danymi firmy (jeśli przypisany)  

❌ Nie może zarządzać innymi użytkownikami  
❌ Nie ma dostępu do panelu admin  
❌ Nie widzi treningów innych twórców (opcjonalnie)  

### **Dostęp do:**
- `/dashboard` - Dashboard z własnymi treningami
- `/trainings/create` - Tworzenie nowego treningu
- `/trainings/edit/:id` - Edycja treningu
- `/editor` - Edytor scen 3D
- `/dialog` - Edytor dialogów
- `/company/profile` - Profil firmy
- `/reports/my-trainings` - Statystyki własnych treningów

### **Dane w bazie:**
```csharp
// AspNetRoles
Role: "CREATOR"

// AspNetUsers
User {
    Email: "creator@company.com",
    UserName: "Creator Name",
    Roles: ["CREATOR"]
}

// TrainingCreator (relacja)
TrainingCreator {
    UserId: "creator-user-id",
    CompanyId: "company-id" // opcjonalnie
}
```

### **Przykładowe konto (do utworzenia):**
```
Email: creator@edutailor.pl
Password: Creator123!
Role: CREATOR
```

---

## 3️⃣ PARTICIPANT (Uczestnik Szkolenia)

### **Uprawnienia:**
✅ Przeglądanie przypisanych treningów  
✅ Uczestnictwo w treningach (viewer mode)  
✅ Wykonywanie quizów i zadań  
✅ Śledzenie własnego postępu  
✅ Certyfikaty po ukończeniu  
✅ Profil użytkownika  

❌ Nie może tworzyć treningów  
❌ Nie ma dostępu do edytorów  
❌ Nie widzi treningów innych uczestników  
❌ Nie może edytować treningów  

### **Dostęp do:**
- `/my-trainings` - Lista przypisanych treningów
- `/viewer/:id` - Odtwarzanie treningu
- `/profile` - Profil użytkownika
- `/certificates` - Certyfikaty
- `/progress` - Postęp w szkoleniach

### **Dane w bazie:**
```csharp
// AspNetRoles
Role: "USER" lub "PARTICIPANT"

// AspNetUsers
User {
    Email: "participant@company.com",
    UserName: "Participant Name",
    Roles: ["USER"]
}

// TrainingParticipant (nowa tabela)
TrainingParticipant {
    UserId: "participant-user-id",
    TrainingId: "training-id",
    Progress: 0-100,
    CompletedAt: DateTime?,
    Score: int?
}
```

### **Przykładowe konto (do utworzenia):**
```
Email: participant@edutailor.pl
Password: Participant123!
Role: USER
```

---

## 🏢 DANE FIRMY

Każdy Creator i Participant może być przypisany do firmy/organizacji.

### **Model Company:**
```csharp
public class Company {
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public string NIP { get; set; }
    public string ContactEmail { get; set; }
    public string ContactPhone { get; set; }
    public string LogoUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Relationships
    public List<User> Users { get; set; }
    public List<Training> Trainings { get; set; }
}
```

---

## 🔐 Implementacja w Backend

### **1. Dodaj nowe role:**
```csharp
// DataProvider.cs
public async Task CreateRoles() {
    if (!await _roleManager.RoleExistsAsync("ADMIN"))
        await _roleManager.CreateAsync(new IdentityRole("ADMIN"));
    
    if (!await _roleManager.RoleExistsAsync("CREATOR"))
        await _roleManager.CreateAsync(new IdentityRole("CREATOR"));
    
    if (!await _roleManager.RoleExistsAsync("USER"))
        await _roleManager.CreateAsync(new IdentityRole("USER"));
}
```

### **2. Dodaj Company model:**
```csharp
// Modules/Company/Models/Company.cs
[PrimaryKey(nameof(Id))]
public class Company {
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string NIP { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public List<User> Users { get; set; } = new();
}
```

### **3. Dodaj TrainingParticipant:**
```csharp
// Modules/Training/Models/TrainingParticipant.cs
[PrimaryKey(nameof(Id))]
public class TrainingParticipant {
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; }
    public Guid TrainingId { get; set; }
    public int Progress { get; set; } = 0; // 0-100%
    public DateTime? CompletedAt { get; set; }
    public int? Score { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.Now;
    
    [ForeignKey("UserId")]
    public User User { get; set; }
    
    [ForeignKey("TrainingId")]
    public Training Training { get; set; }
}
```

### **4. Authorization w Controllers:**
```csharp
// TrainingsController.cs
[HttpPost]
[Authorize(Roles = "ADMIN,CREATOR")] // Tylko admin i creator mogą tworzyć
public async Task<IActionResult> CreateTraining(TrainingDTO dto) {
    // ...
}

[HttpGet]
[Authorize] // Wszyscy zalogowani mogą przeglądać
public async Task<IActionResult> GetTrainings() {
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
    
    if (userRole == "ADMIN") {
        // Admin widzi wszystko
        return Ok(await _context.Training.ToListAsync());
    }
    else if (userRole == "CREATOR") {
        // Creator widzi tylko swoje
        return Ok(await _context.Training
            .Where(t => t.CreatorId == userId)
            .ToListAsync());
    }
    else {
        // Participant widzi tylko przypisane
        return Ok(await _context.TrainingParticipant
            .Where(tp => tp.UserId == userId)
            .Include(tp => tp.Training)
            .Select(tp => tp.Training)
            .ToListAsync());
    }
}
```

---

## 🎯 Frontend - Route Guards

### **Routing z rolami:**
```typescript
// router.tsx
<Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
  <Route path="/admin" element={<AdminPanel />} />
  <Route path="/users" element={<UserManagement />} />
</Route>

<Route element={<ProtectedRoute allowedRoles={['ADMIN', 'CREATOR']} />}>
  <Route path="/trainings/create" element={<CreateTraining />} />
  <Route path="/editor" element={<EditorPage />} />
  <Route path="/dialog" element={<DialogPage />} />
</Route>

<Route element={<ProtectedRoute allowedRoles={['ADMIN', 'CREATOR', 'USER']} />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/viewer/:id" element={<ViewerPage />} />
</Route>
```

### **ProtectedRoute z rolami:**
```typescript
export const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const userRole = getUserRole() // z JWT token
  
  if (!loginManager.isLoggedIn) {
    return <Navigate to="/auth/login" />
  }
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />
  }
  
  return <Outlet />
}
```

---

## 📊 Podsumowanie

| Funkcja | Admin | Creator | Participant |
|---------|-------|---------|-------------|
| Tworzenie treningów | ✅ | ✅ | ❌ |
| Edycja treningów | ✅ Wszystkie | ✅ Własne | ❌ |
| Odtwarzanie treningów | ✅ | ✅ | ✅ |
| Zarządzanie użytkownikami | ✅ | ❌ | ❌ |
| Zarządzanie firmami | ✅ | ✅ Własna | ❌ |
| Statystyki globalne | ✅ | ❌ | ❌ |
| Statystyki własne | ✅ | ✅ | ✅ |
| Panel admin | ✅ | ❌ | ❌ |
| Edytor 3D | ✅ | ✅ | ❌ |
| Edytor dialogów | ✅ | ✅ | ❌ |

---

**Ostatnia aktualizacja:** 2025-11-11  
**Status:** 📋 PLANNED - Do implementacji
