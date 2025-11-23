# 🔒 HTTPS na Localhost - Przewodnik

## ❓ Dlaczego przeglądarka mówi "Not Secure"?

Frontend (Vite) używa **self-signed certificate** dla HTTPS na localhost. To jest **normalne i bezpieczne** dla developmentu lokalnego.

---

## ✅ Jak zaakceptować certyfikat w przeglądarce:

### **Chrome / Edge:**
1. Otwórz https://localhost:5173
2. Zobaczysz ostrzeżenie: "Your connection is not private"
3. Kliknij **"Advanced"** (Zaawansowane)
4. Kliknij **"Proceed to localhost (unsafe)"** (Przejdź do localhost)
5. ✅ Gotowe! Strona się załaduje

### **Firefox:**
1. Otwórz https://localhost:5173
2. Zobaczysz: "Warning: Potential Security Risk Ahead"
3. Kliknij **"Advanced..."**
4. Kliknij **"Accept the Risk and Continue"**
5. ✅ Gotowe!

### **Safari:**
1. Otwórz https://localhost:5173
2. Zobaczysz: "This Connection Is Not Private"
3. Kliknij **"Show Details"**
4. Kliknij **"visit this website"**
5. Potwierdź
6. ✅ Gotowe!

---

## 🔧 Alternatywa: Wyłącz HTTPS (tylko HTTP)

Jeśli chcesz uniknąć ostrzeżeń, możesz uruchomić frontend bez HTTPS:

### **Krok 1: Edytuj vite.config.ts**
```typescript
// Usuń lub zakomentuj basicSsl()
export default defineConfig({
  plugins: [
    // basicSsl(),  // <-- zakomentuj tę linię
    svgr(),
    react()
  ]
})
```

### **Krok 2: Restart frontend**
```bash
# Zatrzymaj obecny serwer (Ctrl+C)
npm run dev
```

### **Krok 3: Otwórz**
```
http://localhost:5173  (bez 's' w http)
```

---

## 🎯 Dlaczego używamy HTTPS w dev?

1. **Service Workers** - wymagają HTTPS
2. **WebXR (VR)** - wymaga HTTPS
3. **Geolocation API** - wymaga HTTPS
4. **Camera/Microphone** - wymagają HTTPS
5. **Symulacja produkcji** - produkcja zawsze używa HTTPS

---

## ✅ Aktualny status:

| Serwis | URL | Protokół | Certyfikat |
|--------|-----|----------|------------|
| Frontend | https://localhost:5173 | HTTPS | Self-signed (dev) |
| Backend | http://localhost:5007 | HTTP | Brak (nie potrzebny) |
| Static | http://localhost:5008 | HTTP | Brak (nie potrzebny) |

**To jest prawidłowa konfiguracja dla developmentu lokalnego!** ✅

---

## 🚀 Produkcja:

W produkcji używamy **prawdziwych certyfikatów** (Let's Encrypt):
- Frontend: https://edutailor.ai (prawdziwy SSL)
- Backend: https://api.edutailor.ai (prawdziwy SSL)
- Static: https://static.edutailor.ai (prawdziwy SSL)

---

## 📝 Podsumowanie:

✅ **Ostrzeżenie "Not Secure" na localhost jest NORMALNE**  
✅ **Self-signed certificate jest BEZPIECZNY dla developmentu**  
✅ **Kliknij "Proceed" / "Accept Risk" i kontynuuj**  
✅ **Alternatywnie: wyłącz HTTPS i użyj HTTP**

**Nie martw się - to nie jest błąd! 🎉**
