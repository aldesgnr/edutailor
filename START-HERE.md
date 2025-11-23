# 🚀 BD-Academy - Quick Start Guide

## ⚡ Szybki Start

### Uruchom wszystko jedną komendą:
```bash
./start-all.sh
```

### Zatrzymaj wszystko:
```bash
./stop-all.sh
```

---

## 🌐 Adresy Serwisów

| Serwis | URL | Opis |
|--------|-----|------|
| **Frontend** | http://localhost:5173 | Aplikacja React |
| **Backend API** | http://localhost:5007 | .NET Core API |
| **Static Files** | http://localhost:5008 | Sceny GLB, tekstury, modele |
| **MySQL** | localhost:3310 | Baza danych |

---

## 🔐 Login

```
Email: admin@admin.pl
Password: mju7&UJM
```

---

## 📋 Wymagania

### Zainstalowane:
- ✅ Node.js (npm)
- ✅ Python 3
- ✅ Docker Desktop
- ✅ Git

### Sprawdź:
```bash
node --version
python3 --version
docker --version
```

---

## 🛠️ Ręczne Uruchamianie (jeśli skrypt nie działa)

### 1. Backend (Docker):
```bash
cd bd-academy-backend
docker-compose -f docker-compose.local.yml up -d
```

### 2. Static Server (with CORS):
```bash
cd bd-academy-static
python3 cors-server.py
```

### 3. Frontend:
```bash
cd bd-academy
npm run dev
```

---

## 🎮 Jak Używać Edytora

### Sterowanie Kamerą:
- **W A S D** / **Strzałki** - Przesuwanie kamery (góra/dół/lewo/prawo)
- **Mysz** - Obracanie kamery
- **Scroll** - Zoom
- **SPACE** - Reset kamery

### Zamienianie Osób:
1. Kliknij na osobę w scenie (pojawi się **Yellow Box**)
2. Otwórz panel **Persons** (prawy panel)
3. Kliknij nową osobę (Walter White, Harold, Mia)
4. Osoba się zamieni!

---

## 🐛 Troubleshooting

### Biały ekran:
```bash
# Hard refresh w przeglądarce
Cmd+Shift+R (Mac)
Ctrl+Shift+R (Windows)
```

### Scena się nie ładuje:
1. Sprawdź czy wszystkie serwisy działają:
```bash
lsof -ti:5173 -ti:5007 -ti:5008
```

2. Sprawdź logi w Console (F12)

3. **CORS Error?** Upewnij się że używasz `cors-server.py`:
```bash
lsof -ti:5008 | xargs kill -9
cd bd-academy-static
python3 cors-server.py
```

4. Zrestartuj wszystko:
```bash
./stop-all.sh
./start-all.sh
```

### Docker nie działa:
1. Uruchom **Docker Desktop**
2. Poczekaj aż się uruchomi (ikona wieloryba w górnym pasku)
3. Uruchom ponownie `./start-all.sh`

---

## 📁 Struktura Projektu

```
ilms (1)/
├── bd-academy/              # Frontend (React + Vite)
├── bd-academy-backend/      # Backend (.NET Core)
├── bd-academy-static/       # Pliki statyczne (GLB, tekstury)
├── start-all.sh            # Uruchom wszystko
├── stop-all.sh             # Zatrzymaj wszystko
└── START-HERE.md           # Ten plik
```

---

## 🔧 Konfiguracja

### Frontend (.env):
```bash
cd bd-academy
cat .env
```

### Backend (docker-compose):
```bash
cd bd-academy-backend
cat docker-compose.local.yml
```

---

## 📝 Notatki

- **Dysk sieciowy** może powodować timeouty - lepiej pracować na lokalnym dysku
- **HTTPS** na static server wymaga akceptacji certyfikatu - używamy HTTP
- **WASD** sterowanie zostało zmienione z obracania na przesuwanie kamery
- **Yellow Box** wymaga zaznaczenia osoby przed zamianą

---

## 🆘 Pomoc

Jeśli coś nie działa:
1. Sprawdź logi w Console (F12)
2. Sprawdź czy Docker działa
3. Sprawdź czy wszystkie porty są wolne
4. Zrestartuj wszystko: `./stop-all.sh && ./start-all.sh`

---

**Powodzenia! 🎉**
