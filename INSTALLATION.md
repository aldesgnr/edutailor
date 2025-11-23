# 📦 INSTALLATION GUIDE

**Complete installation guide for EduTailor.ai platform**

---

## 📋 **TABLE OF CONTENTS**

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Static Server Setup](#static-server-setup)
5. [Database Setup](#database-setup)
6. [Testing Setup](#testing-setup)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 **PREREQUISITES**

### **Required Software:**

#### **1. Node.js (v18+)**
```bash
# macOS
brew install node@18

# Verify
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
```

#### **2. .NET SDK (v7.0)**
```bash
# macOS
brew install dotnet-sdk

# Verify
dotnet --version  # Should be 7.0.x
```

#### **3. Docker & Docker Compose**
```bash
# macOS
brew install --cask docker

# Start Docker Desktop
open -a Docker

# Verify
docker --version
docker-compose --version
```

#### **4. MySQL (via Docker)**
```bash
# Will be installed via docker-compose
# No manual installation needed
```

#### **5. Python 3.11+**
```bash
# macOS (usually pre-installed)
python3 --version  # Should be 3.11+

# If not installed
brew install python@3.11
```

#### **6. Git**
```bash
# macOS (usually pre-installed)
git --version

# If not installed
brew install git
```

---

## 🗄️ **DATABASE SETUP**

### **Option 1: Docker (Recommended)**

```bash
cd bd-academy-backend

# Start MySQL container
docker-compose up -d

# Wait for MySQL to be ready (10 seconds)
sleep 10

# Verify MySQL is running
docker ps | grep mysql

# Test connection
docker exec -it bd-academy-mysql mysql -uroot -p
# Password: password (from docker-compose.yml)
```

### **Option 2: Local MySQL**

```bash
# Install MySQL
brew install mysql

# Start MySQL
brew services start mysql

# Create database
mysql -uroot -p
CREATE DATABASE academy;
CREATE USER 'academy_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON academy.* TO 'academy_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### **Database Migrations:**

```bash
cd bd-academy-backend

# Run migrations
dotnet ef database update

# Verify tables
mysql -uroot -p academy
SHOW TABLES;
```

---

## 🔙 **BACKEND SETUP**

### **1. Install Dependencies:**

```bash
cd bd-academy-backend

# Restore NuGet packages
dotnet restore

# Verify packages
dotnet list package
```

### **2. Configuration:**

```bash
# Copy appsettings template
cp appsettings.json appsettings.Development.json

# Edit configuration
nano appsettings.Development.json
```

**appsettings.Development.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=academy;User=root;Password=password;"
  },
  "Jwt": {
    "Secret": "your-secret-key-min-32-characters-long",
    "Issuer": "http://localhost:5007",
    "Audience": "http://localhost:5173"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### **3. Build & Run:**

```bash
# Build
dotnet build

# Run
dotnet run

# Backend will be available at: http://localhost:5007
```

### **4. Verify Backend:**

```bash
# Test health endpoint
curl http://localhost:5007/health

# Test API
curl http://localhost:5007/api/Trainings
```

---

## 🎨 **FRONTEND SETUP**

### **1. Install Dependencies:**

```bash
cd bd-academy

# Install npm packages
npm install

# Verify installation
npm list --depth=0
```

### **2. Configuration:**

```bash
# Copy environment template
cp .env.example .env.development

# Edit configuration
nano .env.development
```

**.env.development:**
```bash
VITE_BD_ACADEMY_BASE_URL=/
VITE_BD_ACADEMY_API_URL=http://localhost:5007
VITE_BD_ACADEMY_STATIC_URL=http://localhost:5008
```

### **3. Build & Run:**

```bash
# Development mode
npm run dev

# Frontend will be available at: http://localhost:5173
```

### **4. Verify Frontend:**

```bash
# Open in browser
open http://localhost:5173

# Login credentials:
# Email: admin@admin.pl
# Password: mju7&UJM
```

---

## 📁 **STATIC SERVER SETUP**

### **1. Setup:**

```bash
cd bd-academy-static

# Verify Python
python3 --version

# No dependencies needed
```

### **2. Run:**

```bash
# Start CORS server
python3 cors-server.py

# Static server will be available at: http://localhost:5008
```

### **3. Verify Static Server:**

```bash
# Test CORS
curl -I http://localhost:5008/

# Should see:
# Access-Control-Allow-Origin: *
```

---

## 🧪 **TESTING SETUP**

### **1. Install Test Dependencies:**

```bash
cd bd-academy

# Install Vitest and testing libraries
npm install -D vitest @vitest/ui @vitest/coverage-v8 \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  jsdom @types/node

# Install Playwright
npm install -D @playwright/test

# Install Playwright browsers
npx playwright install
```

### **2. Verify Test Setup:**

```bash
# Run unit tests
npm run test:run

# Expected output:
# ✓ src/services/training/training.service.test.ts (7)
# ✓ src/components/training/training-card.test.tsx (7)
# ✓ src/pages/dashboard/dashboard.page.test.tsx (8)
# Test Files  3 passed (3)
# Tests  22 passed (22)

# Run E2E tests
npm run test:e2e

# Expected output:
# ✓ e2e/auth.spec.ts (5 tests)
# ✓ e2e/training-crud.spec.ts (6 tests)
# ✓ e2e/editor.spec.ts (7 tests)
# 18 passed (1.2m)
```

### **3. Test Coverage:**

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

---

## 🚀 **PRODUCTION DEPLOYMENT**

### **Option 1: Docker Compose (Recommended)**

#### **1. Prepare Environment:**

```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit with your production values
nano .env.production
```

#### **2. Build & Deploy:**

```bash
# Build frontend
cd bd-academy
npm run build

# Build backend Docker image
cd ../bd-academy-backend
docker build -t edutailor-backend:latest .

# Start all services
cd ..
docker-compose -f docker-compose.prod.yml up -d
```

#### **3. Verify Deployment:**

```bash
# Check services
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Test endpoints
curl http://localhost/health
curl http://localhost:5007/health
```

---

### **Option 2: GitHub Actions CI/CD**

#### **1. Setup GitHub Secrets:**

Navigate to: `Settings → Secrets and variables → Actions`

**Add these secrets:**
```
DOCKER_USERNAME
DOCKER_PASSWORD
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID
PROD_HOST
PROD_USER
PROD_SSH_KEY
AWS_S3_BUCKET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
DB_CONNECTION_STRING
JWT_SECRET
JWT_ISSUER
JWT_AUDIENCE
FRONTEND_URL
API_URL
STATIC_URL
```

#### **2. Push to GitHub:**

```bash
git add .
git commit -m "feat: ready for production"
git push origin main

# CI pipeline will run automatically
```

#### **3. Create Release:**

```bash
# Tag release
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Deploy pipeline will run automatically
```

---

## 🔐 **SSL CERTIFICATES (Production)**

### **Using Let's Encrypt:**

```bash
# Install certbot
brew install certbot

# Generate certificate
sudo certbot certonly --webroot \
  -w /usr/share/nginx/html \
  -d your-domain.com \
  -d www.your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./nginx/ssl/

# Restart Nginx
docker-compose -f docker-compose.prod.yml restart frontend
```

### **Auto-renewal:**

```bash
# Add to crontab
sudo crontab -e

# Add this line (renew every 3 months)
0 0 1 */3 * certbot renew --quiet && docker-compose -f /path/to/docker-compose.prod.yml restart frontend
```

---

## 🐛 **TROUBLESHOOTING**

### **Issue: Backend won't start**

```bash
# Check MySQL
docker ps | grep mysql
docker logs bd-academy-mysql

# Check connection string
cat bd-academy-backend/appsettings.Development.json

# Restart MySQL
docker restart bd-academy-mysql

# Clear and rebuild
cd bd-academy-backend
dotnet clean
dotnet build
```

### **Issue: Frontend build fails**

```bash
# Clear cache
cd bd-academy
rm -rf node_modules package-lock.json dist
npm install

# Check Node version
node --version  # Should be v18+

# Try building
npm run build
```

### **Issue: Tests fail**

```bash
# Make sure all services are running
# Backend: http://localhost:5007
# Frontend: http://localhost:5173

# Clear test cache
npm run test -- --clearCache

# Run with verbose output
npm run test:run -- --reporter=verbose
```

### **Issue: Port already in use**

```bash
# Find process
lsof -i :5173  # Frontend
lsof -i :5007  # Backend
lsof -i :5008  # Static
lsof -i :3306  # MySQL

# Kill process
kill -9 <PID>

# Or use different ports in config
```

### **Issue: Docker containers won't start**

```bash
# Check Docker is running
docker ps

# Remove old containers
docker-compose down -v

# Rebuild
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### **Issue: Database connection fails**

```bash
# Test MySQL connection
docker exec -it bd-academy-mysql mysql -uroot -p

# Check connection string
cat bd-academy-backend/appsettings.Development.json

# Verify database exists
mysql -uroot -p -e "SHOW DATABASES;"

# Recreate database
mysql -uroot -p -e "DROP DATABASE IF EXISTS academy; CREATE DATABASE academy;"
```

---

## ✅ **VERIFICATION CHECKLIST**

### **After Installation:**

- [ ] MySQL running on port 3306
- [ ] Backend running on port 5007
- [ ] Static server running on port 5008
- [ ] Frontend running on port 5173
- [ ] Can login with admin credentials
- [ ] Can create/edit/delete trainings
- [ ] Editor loads correctly
- [ ] 3D scene renders
- [ ] Dialog editor works

### **After Test Setup:**

- [ ] Unit tests pass (22 tests)
- [ ] E2E tests pass (18 tests)
- [ ] Coverage >70%
- [ ] No lint errors
- [ ] No TypeScript errors

### **After Production Deployment:**

- [ ] All services running
- [ ] SSL certificates valid
- [ ] Health checks passing
- [ ] Database backed up
- [ ] Monitoring configured
- [ ] Logs accessible

---

## 📚 **ADDITIONAL RESOURCES**

### **Documentation:**
- [QUICK-START.md](QUICK-START.md) - Quick start guide
- [README.md](README.md) - Project overview
- [CI-CD-README.md](CI-CD-README.md) - CI/CD guide
- [TESTING-README.md](bd-academy/TESTING-README.md) - Testing guide

### **Scripts:**
- `start-all.sh` - Start all services
- `stop-all.sh` - Stop all services

### **Support:**
- GitHub Issues
- Email: support@edutailor.ai

---

**Created:** 2025-11-23  
**Author:** AI Assistant  
**Status:** ✅ Complete  
**Version:** 1.0.0
