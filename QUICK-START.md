# 🚀 QUICK START GUIDE

**Last Updated:** 2025-11-23  
**Status:** ✅ Production Ready  
**Time to Start:** ~15 minutes

---

## 📋 **TABLE OF CONTENTS**

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Run Tests](#run-tests)
4. [Deploy to Production](#deploy-to-production)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 **PREREQUISITES**

### **Required Software:**
```bash
# Check versions
node --version    # v18.x or higher
npm --version     # v9.x or higher
docker --version  # v20.x or higher
dotnet --version  # v7.x or higher
```

### **Install if Missing:**
```bash
# Node.js (macOS)
brew install node@18

# Docker (macOS)
brew install --cask docker

# .NET SDK (macOS)
brew install dotnet-sdk
```

---

## 💻 **LOCAL DEVELOPMENT**

### **1. Clone Repository:**
```bash
git clone <your-repo-url>
cd ilms
```

### **2. Start Backend (Docker):**
```bash
# Start MySQL database
cd bd-academy-backend
docker-compose up -d

# Wait for MySQL to be ready (10 seconds)
sleep 10

# Run backend
dotnet run

# Backend will be available at: http://localhost:5007
```

### **3. Start Static Server:**
```bash
# In new terminal
cd bd-academy-static
python3 cors-server.py

# Static server will be available at: http://localhost:5008
```

### **4. Start Frontend:**
```bash
# In new terminal
cd bd-academy
npm install
npm run dev

# Frontend will be available at: http://localhost:5173
```

### **5. Open Browser:**
```bash
# Open in browser
open http://localhost:5173

# Login credentials:
# Email: admin@admin.pl
# Password: mju7&UJM
```

### **✅ You're Ready!**
All services should now be running:
- Frontend: http://localhost:5173
- Backend: http://localhost:5007
- Static: http://localhost:5008
- MySQL: localhost:3306

---

## 🧪 **RUN TESTS**

### **1. Install Test Dependencies:**
```bash
cd bd-academy

# Install Vitest and testing libraries
npm install -D vitest @vitest/ui @vitest/coverage-v8 \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  jsdom @types/node

# Install Playwright
npm install -D @playwright/test
npx playwright install
```

### **2. Run Unit Tests:**
```bash
# Run once
npm run test:run

# Watch mode
npm run test

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

**Expected Output:**
```
✓ src/services/training/training.service.test.ts (7)
✓ src/components/training/training-card.test.tsx (7)
✓ src/pages/dashboard/dashboard.page.test.tsx (8)

Test Files  3 passed (3)
     Tests  22 passed (22)
  Duration  2.5s
```

### **3. Run E2E Tests:**
```bash
# Make sure all services are running!
# Then run E2E tests:

# Run all tests
npm run test:e2e

# Run with UI (recommended)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

**Expected Output:**
```
Running 18 tests using 3 workers

  ✓ e2e/auth.spec.ts (5 tests) - 9.1s
  ✓ e2e/training-crud.spec.ts (6 tests) - 21.1s
  ✓ e2e/editor.spec.ts (7 tests) - 64.3s

  18 passed (1.2m)
```

---

## 🚀 **DEPLOY TO PRODUCTION**

### **Option A: GitHub Actions (Recommended)**

#### **1. Setup GitHub Secrets:**
Navigate to: `Settings → Secrets and variables → Actions`

**Required Secrets:**
```bash
# Docker Hub
DOCKER_USERNAME=your-username
DOCKER_PASSWORD=your-password

# Netlify
NETLIFY_AUTH_TOKEN=your-token
NETLIFY_SITE_ID=your-site-id

# Production Server
PROD_HOST=your-server-ip
PROD_USER=deploy-user
PROD_SSH_KEY=your-private-key

# AWS S3
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# URLs
FRONTEND_URL=https://your-domain.com
API_URL=https://api.your-domain.com
STATIC_URL=https://static.your-domain.com

# Database
DB_CONNECTION_STRING=Server=mysql;Port=3306;Database=academy;User=user;Password=pass

# JWT
JWT_SECRET=your-secret-min-32-chars
JWT_ISSUER=https://your-domain.com
JWT_AUDIENCE=https://your-domain.com
```

#### **2. Push to GitHub:**
```bash
git add .
git commit -m "feat: ready for production"
git push origin main

# CI pipeline will run automatically!
# Check progress in: Actions tab
```

#### **3. Create Release:**
```bash
# Tag a release
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Deploy pipeline will run automatically!
```

#### **4. Monitor Deployment:**
- Go to GitHub Actions tab
- Watch CI/CD pipelines
- Check deployment status
- Verify production URLs

---

### **Option B: Manual Docker Deployment**

#### **1. Prepare Environment:**
```bash
# Copy environment template
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

#### **2. Build and Deploy:**
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

# Health checks
curl http://localhost/health
curl http://localhost:5007/health
```

---

## 🐛 **TROUBLESHOOTING**

### **Issue: Backend won't start**
```bash
# Check MySQL is running
docker ps | grep mysql

# Check logs
docker logs bd-academy-mysql

# Restart MySQL
docker restart bd-academy-mysql
```

### **Issue: Frontend build fails**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be v18+
```

### **Issue: Tests fail**
```bash
# Make sure services are running
# Check backend: http://localhost:5007
# Check frontend: http://localhost:5173

# Clear test cache
npm run test -- --clearCache

# Run tests with verbose output
npm run test:run -- --reporter=verbose
```

### **Issue: E2E tests timeout**
```bash
# Increase timeout in playwright.config.ts
timeout: 60000  # 60 seconds

# Or run specific test
npx playwright test e2e/auth.spec.ts --debug
```

### **Issue: Docker containers won't start**
```bash
# Check Docker is running
docker ps

# Remove old containers
docker-compose -f docker-compose.prod.yml down -v

# Rebuild and start
docker-compose -f docker-compose.prod.yml up -d --build
```

### **Issue: Port already in use**
```bash
# Find process using port
lsof -i :5173  # Frontend
lsof -i :5007  # Backend
lsof -i :5008  # Static

# Kill process
kill -9 <PID>
```

---

## 📚 **DOCUMENTATION**

### **Detailed Guides:**
- **Testing:** `TESTING-README.md` - Unit tests guide
- **E2E Testing:** `E2E-TESTING-README.md` - E2E tests guide
- **CI/CD:** `CI-CD-README.md` - CI/CD pipeline guide
- **Today's Work:** `TODAY-SUMMARY.md` - Complete summary
- **Progress:** `PROGRESS-UPDATE.md` - Session tracking

### **Installation Guides:**
- **Tests:** `INSTALL-TESTS.md` - Test installation
- **Fixes:** `FUNCTIONAL-FIXES-SUMMARY.md` - Fixes details

---

## ✅ **VERIFICATION CHECKLIST**

### **Local Development:**
- [ ] MySQL running on port 3306
- [ ] Backend running on port 5007
- [ ] Static server running on port 5008
- [ ] Frontend running on port 5173
- [ ] Can login with admin credentials
- [ ] Can create/edit/delete trainings
- [ ] Editor loads correctly

### **Tests:**
- [ ] Unit tests pass (22 tests)
- [ ] E2E tests pass (18 tests)
- [ ] Coverage >70%
- [ ] No lint errors

### **Production:**
- [ ] GitHub secrets configured
- [ ] CI pipeline passes
- [ ] Deploy pipeline passes
- [ ] Production URLs accessible
- [ ] SSL certificates valid
- [ ] Database backed up

---

## 🎯 **NEXT STEPS**

### **After Starting:**
1. **Explore the app** - Try all features
2. **Run tests** - Verify everything works
3. **Read documentation** - Understand the codebase
4. **Plan deployment** - Prepare for production

### **For Development:**
1. **Create feature branch** - `git checkout -b feature/my-feature`
2. **Make changes** - Edit code
3. **Run tests** - `npm run test:run`
4. **Commit** - `git commit -m "feat: my feature"`
5. **Push** - `git push origin feature/my-feature`
6. **Create PR** - GitHub will run CI automatically

### **For Production:**
1. **Setup secrets** - Configure GitHub secrets
2. **Test locally** - Verify all tests pass
3. **Push to main** - Triggers CI pipeline
4. **Create tag** - Triggers deploy pipeline
5. **Monitor** - Watch deployment
6. **Verify** - Check production URLs

---

## 🆘 **NEED HELP?**

### **Resources:**
- **Documentation:** Check README files in project
- **GitHub Issues:** Report bugs or ask questions
- **CI/CD Logs:** Check GitHub Actions for errors
- **Docker Logs:** `docker-compose logs -f`

### **Common Commands:**
```bash
# Restart everything
docker-compose restart
npm run dev

# Check status
docker-compose ps
curl http://localhost:5007/health

# View logs
docker-compose logs -f backend
docker-compose logs -f mysql

# Clean up
docker-compose down -v
rm -rf node_modules
npm install
```

---

## 🎉 **YOU'RE ALL SET!**

The application is now running locally and ready for development or production deployment!

**Happy coding!** 🚀💻✨

---

**Created:** 2025-11-23  
**Author:** AI Assistant  
**Status:** ✅ Ready to use  
**Time to start:** ~15 minutes
