# 🖼️ NAPRAWA OBRAZKÓW - Podsumowanie

## ✅ CO ZOSTAŁO NAPRAWIONE:

### 1. **Logo w Navbar**
**Problem:** Używało `${appConfig().BASE_URL}/logo.png` co dawało `//logo.png`  
**Rozwiązanie:** Zmieniono na `/logo.png` (bezpośredni dostęp do /public)

**Plik:** `bd-academy/src/components/common/navbar/navbar.tsx`
```typescript
// Przed:
<img src={`${appConfig().BASE_URL}/logo.png`} />

// Teraz:
<img src={`/logo.png`} />
```

### 2. **Obrazki scen w editor-configuration.json**
**Problem:** URL produkcyjne `https://ilms.seemymodel.com:4433/...`  
**Rozwiązanie:** Zmieniono na `http://localhost:5008/...`

**Plik:** `bd-academy-static/static/common/editor-configuration.json`
```json
// Przed:
"image": "https://ilms.seemymodel.com:4433/static/common/scenes/doctor_clinic.jpeg"

// Teraz:
"image": "http://localhost:5008/static/common/scenes/doctor_clinic.jpeg"
```

### 3. **Logo skopiowane do static**
**Akcja:** Skopiowano `/bd-academy/public/logo.png` → `/bd-academy-static/static/logo.png`

---

## 📊 Status obrazków:

| Obrazek | Lokalizacja | Status | URL |
|---------|-------------|--------|-----|
| **Logo** | `/public/logo.png` | ✅ Działa | `/logo.png` |
| **Logo (static)** | `/static/logo.png` | ✅ Działa | `http://localhost:5008/static/logo.png` |
| **Doctor clinic** | `/static/common/scenes/doctor_clinic.jpeg` | ✅ Istnieje | `http://localhost:5008/static/common/scenes/doctor_clinic.jpeg` |
| **Inne sceny** | Brak plików | ⚠️ Używają zewnętrznych URL | Freepik, etc. |

---

## 🎯 Jak działają obrazki:

### **Frontend (/public):**
- Logo, ikony, obrazki UI
- Dostępne bezpośrednio: `/logo.png`, `/person-min.png`, etc.
- Serwowane przez Vite

### **Static Server (/static):**
- Sceny 3D (GLB files)
- Avatary (GLB + PNG)
- Dialogi (JSON)
- Konfiguracja (editor-configuration.json)
- Dostępne przez: `http://localhost:5008/static/...`

---

## 🔧 Jak dodać nowe obrazki:

### **Dla UI (logo, ikony):**
1. Dodaj plik do `/bd-academy/public/`
2. Użyj w kodzie: `<img src="/nazwa-pliku.png" />`
3. Vite automatycznie serwuje z `/public`

### **Dla scen 3D:**
1. Dodaj plik do `/bd-academy-static/static/common/scenes/`
2. Dodaj entry w `editor-configuration.json`:
```json
{
  "id": "uuid",
  "name": "Nazwa sceny",
  "model": "/static/common/scenes/plik.glb",
  "image": "http://localhost:5008/static/common/scenes/preview.jpeg",
  "avatars": ["Person_1"]
}
```

### **Dla avatarów:**
1. Dodaj GLB do `/bd-academy-static/static/common/avatar/`
2. Dodaj PNG preview do tej samej lokalizacji
3. Dodaj entry w `editor-configuration.json`:
```json
{
  "id": "uuid",
  "model": "/static/common/avatar/avatar.glb",
  "image": "/static/common/avatar/avatar.png",
  "name": "Nazwa avatara",
  "gender": "male|female",
  "type": "doctor|patient"
}
```

---

## 🐛 Problemy które mogą wystąpić:

### **Obrazki nie ładują się:**
1. Sprawdź Console (F12) - szukaj 404
2. Sprawdź czy plik istnieje w `/public` lub `/static`
3. Sprawdź czy static server działa: `curl http://localhost:5008/static/logo.png`

### **Sceny nie pokazują się w edytorze:**
1. Sprawdź `editor-configuration.json` - czy URL są poprawne
2. Sprawdź czy GLB files istnieją
3. Sprawdź Console - błędy ładowania

### **Logo nie wyświetla się:**
1. Sprawdź czy `/public/logo.png` istnieje
2. Odśwież cache: Ctrl+Shift+R
3. Sprawdź Network tab (F12) - czy request jest 200 OK

---

## ✅ Teraz powinno działać:

1. ✅ Logo w navbar
2. ✅ Obrazki scen (te które istnieją)
3. ✅ Avatary (preview images)
4. ✅ Static assets

---

## 📝 TODO - Brakujące obrazki:

Niektóre sceny używają zewnętrznych URL (Freepik). Należy:
1. Pobrać/stworzyć własne preview images
2. Dodać do `/bd-academy-static/static/common/scenes/`
3. Zaktualizować `editor-configuration.json`

---

**Data naprawy:** 2025-11-11 17:35  
**Status:** ✅ NAPRAWIONE (częściowo - niektóre obrazy zewnętrzne)
