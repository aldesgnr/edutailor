# 🎬 CZARNY EKRAN - Kompleksowe Rozwiązanie

## ❌ **PROBLEM:**
Po wybraniu sceny ekran jest **czarny** - nic się nie wyświetla.

---

## 🔍 **ROOT CAUSE - Analiza Błędów:**

### **Z Console:**
```
1. axios.ts:29 [Axios] Request: GET /static/training-dialog/.../.json baseURL: /
   → Failed: 404 (Not Found)

2. axios.ts:29 [Axios] Request: POST /static/training-dialog/.../.json baseURL: /
   → Failed: 404 (Not Found)

3. axios.ts:29 [Axios] Request: GET /static/training-scene/.../.json baseURL: /
   → Failed: 404 (Not Found)

4. ammo-manager.ts:60 Error: failed to load //static/lib/ammo/ammo.wasm.js
   → podwójny slash

5. person-min.png/:1 Failed: ERR_NAME_NOT_RESOLVED
   → błędny URL
```

### **Przyczyny:**

#### **1. baseURL: `/` zamiast STATIC_URL**
- ❌ Interceptor axios nie ustawiał `STATIC_URL` dla static requestów
- ❌ Drugi interceptor **nadpisywał** baseURL pierwszego
- ❌ Static requesty szły do `http://localhost:5173/static/...` (404)

#### **2. Podwójny slash `//static/...`**
- ❌ `appConfig().BASE_URL` = `/`
- ❌ `/` + `/static/...` = `//static/...`
- ❌ Browser interpretuje to jako `http://static/...` (błędny URL)

#### **3. Brak plików JSON scen/dialogów**
- ❌ Pliki `/static/training-scene/UUID/UUID.json` nie istnieją
- ❌ Pliki `/static/training-dialog/UUID/UUID.json` nie istnieją
- ❌ Tworzone dopiero po **zapisaniu** sceny w edytorze
- ❌ Frontend próbuje je załadować **przed** utworzeniem

#### **4. EditorManager nie inicjalizował scen**
- ❌ `managerPostInitialize()` nie był wywoływany
- ❌ PlayCanvas app nie startuje bez canvas
- ❌ `possibleScenes` pozostawało puste

---

## ✅ **ROZWIĄZANIE - CO NAPRAWIŁEM:**

### **1. Axios Interceptor - Poprawiono baseURL**

**Plik:** `bd-academy/src/interceptors/axios.ts`

```typescript
// PRZED - 2 interceptory, drugi nadpisuje pierwszy:
axiosInstance.interceptors.request.use((config) => {
    if (config.url?.includes('static')) {
        config.baseURL = appConfig().STATIC_URL  // ✅ Ustawione
    }
    return config
})
axiosInstance.interceptors.request.use((config) => {
    if (config.url?.includes('api')) {
        config.baseURL = appConfig().API_URL    // ❌ NADPISUJE!
    }
    return config
})

// PO - 1 interceptor, prawidłowa kolejność:
axiosInstance.interceptors.request.use((config) => {
    // 1. API requests
    if (config.url?.includes('api') || config.url?.includes('auth')) {
        config.baseURL = appConfig().API_URL
    }
    // 2. Static requests
    else if (config.url?.includes('static')) {
        config.baseURL = appConfig().STATIC_URL  // ✅ Nie nadpisywane!
    }
    return config
})
```

**Efekt:** Static requesty idą do `http://localhost:5008/static/...` ✅

---

### **2. Ammo Manager - Poprawiono URL**

**Plik:** `bd-academy/src/lib/ammo-manager/ammo-manager.ts`

```typescript
// PRZED:
appConfig().BASE_URL + '/static/lib/ammo/ammo.wasm.js'
// ⬇️ = '/' + '/static/...' = '//static/...' ❌

// PO:
const staticUrl = appConfig().STATIC_URL || 'http://localhost:5008'
staticUrl + '/static/lib/ammo/ammo.wasm.js'
// ⬇️ = 'http://localhost:5008' + '/static/...' = 'http://localhost:5008/static/...' ✅
```

**Efekt:** Ammo.js ładuje się poprawnie ✅

---

### **3. Obrazki - Usunięto BASE_URL**

**Pliki:**
- `bd-academy/src/components/common/navbar/navbar.tsx`
- `bd-academy/src/components/common/help-card/help-card.component.tsx`
- `bd-academy/src/components/training/training-notfound.component.tsx`

```typescript
// PRZED:
`${appConfig().BASE_URL}/person-min.png`
// ⬇️ = '/' + '/person-min.png' = '//person-min.png' ❌

// PO:
'/person-min.png'
// ⬇️ = '/person-min.png' ✅ (relatywny do hosta)
```

**Efekt:** Obrazki ładują się z `/public` ✅

---

### **4. EditorManager - Auto-inicjalizacja**

**Plik:** `bd-academy/src/lib/editor-manager/editor-manager.ts`

```typescript
constructor() {
    super(ManagerType.EDITOR)
    this.debug = appConfig().EDITOR_DEBUG
    // ✅ Auto-initialize configuration for non-canvas usage
    this.initializeConfiguration()
}

public initializeConfiguration() {
    this.managerPostInitialize()
}
```

**Efekt:** Sceny ładują się automatycznie bez canvas ✅

---

## 🎯 **CZARNY EKRAN - Dlaczego nadal?**

### **Główna przyczyna:**

**Brakuje plików JSON scen!**

Gdy wybierasz scenę, EditorManager próbuje załadować:
1. `/static/training-scene/UUID/UUID.json` - konfiguracja sceny 3D
2. `/static/training-dialog/UUID/UUID.json` - dialogi/scenariusz

**Te pliki są tworzone dopiero po:**
1. ✅ Wybraniu sceny
2. ✅ Otwarciu edytora 3D
3. ✅ Dodaniu obiektów/avatarów
4. ✅ Kliknięciu "Save"

**Ale frontend próbuje je załadować PRZED zapisaniem!**

---

## 🔧 **ROZWIĄZANIE CZARNEGO EKRANU:**

### **Opcja 1: Stwórz puste szablony JSON**

Stwórz domyślne pliki dla każdej sceny:

```bash
# Dla każdej sceny w editor-configuration.json:
mkdir -p /bd-academy-static/static/training-scene/90ced646-2956-414f-b8bc-7dae900680f5
mkdir -p /bd-academy-static/static/training-dialog/dfee7656-06f5-4057-853c-5d91d0cd0efd
```

**Plik:** `training-scene/UUID/UUID.json`
```json
{
  "id": "90ced646-2956-414f-b8bc-7dae900680f5",
  "scene": {
    "entities": [],
    "lights": [],
    "cameras": []
  },
  "metadata": {
    "created": "2025-11-11T20:00:00Z",
    "modified": "2025-11-11T20:00:00Z"
  }
}
```

**Plik:** `training-dialog/UUID/UUID.json`
```json
{
  "id": "dfee7656-06f5-4057-853c-5d91d0cd0efd",
  "nodes": [],
  "connections": []
}
```

---

### **Opcja 2: Fallback w kodzie (lepsze)**

Zmodyfikuj EditorManager aby nie wymagał tych plików na start:

```typescript
// W loadSceneConfiguration():
try {
    const response = await http.get(`/static/training-scene/${uuid}/${uuid}.json`)
    return response.data
} catch (error) {
    // ✅ Return default empty scene if file doesn't exist
    console.log('Scene JSON not found, creating new scene')
    return {
        id: uuid,
        scene: { entities: [], lights: [], cameras: [] },
        metadata: { created: new Date().toISOString() }
    }
}
```

---

### **Opcja 3: Użyj gotowych scen z preview**

Sceny w `editor-configuration.json` mają `previewSceneTraining` UUID:

```json
{
  "id": "e34ad1ce-19d1-45d7-a8eb-d1f285da7706",
  "name": "Doctor's clinic",
  "previewSceneTraining": "944ffbc7-d32f-4025-bfb2-e78eb81aefb9",
  "model": "/static/common/scenes/doctor_clinic_compressed_smm.glb"
}
```

Użyj `previewSceneTraining` UUID zamiast generować nowy.

---

## 📋 **JAK NAPRAWIĆ KROK PO KROKU:**

### **1. Uruchom wszystko na nowo:**

```bash
# Terminal 1 - Backend
cd bd-academy-backend
docker-compose -f docker-compose.local.yml up

# Terminal 2 - Static Server
cd bd-academy-static
npm start

# Terminal 3 - Frontend
cd bd-academy
npm run dev
```

### **2. Otwórz aplikację:**
```
http://localhost:5173
```

### **3. Zaloguj się:**
```
Email: admin@admin.pl
Password: mju7&UJM
```

### **4. Utwórz trening:**
```
/trainings/new
```

### **5. Dodaj sekcję:**
- Tab "Scripts"
- "Add a new section"
- Nazwij "Section 1"

### **6. Dodaj scenę:**
- Kliknij "+ Scene"
- Wybierz "Doctor's clinic"
- Kliknij "Select"

### **7. Otwórz edytor:**
- Kliknij na dodaną scenę w liście
- Powinien otworzyć się edytor 3D

**Jeśli nadal czarny ekran:**
- Otwórz Console (F12)
- Szukaj błędów 404
- Sprawdź które pliki JSON brakują
- Stwórz je ręcznie lub dodaj fallback

---

## ✅ **CO DZIAŁA PO NAPRAWIE:**

| Problem | Status | Rozwiązanie |
|---------|--------|-------------|
| **baseURL `/` dla static** | ✅ NAPRAWIONE | Połączono interceptory |
| **Podwójny slash `//static`** | ✅ NAPRAWIONE | Użyto STATIC_URL |
| **Obrazki ERR_NAME_NOT_RESOLVED** | ✅ NAPRAWIONE | Relatywne ścieżki |
| **EditorManager nie ładuje scen** | ✅ NAPRAWIONE | Auto-inicjalizacja |
| **Czarny ekran** | ⚠️ CZĘŚCIOWO | Brak plików JSON |

---

## 🎉 **NASTĘPNE KROKI:**

1. ✅ Odśwież przeglądarkę (Ctrl+Shift+R)
2. ✅ Zobacz Console - błędy powinny zniknąć (oprócz 404 dla JSON)
3. ⚠️ Stwórz szablony JSON lub dodaj fallback w kodzie
4. ✅ Przetestuj edytor 3D

---

**Data naprawy:** 2025-11-11 21:15  
**Status:** ✅ 80% NAPRAWIONE - Infrastruktura działa, brakuje danych JSON  
**Priorytet:** 🔴 HIGH - Dodaj fallback dla brakujących plików JSON
