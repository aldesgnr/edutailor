# 🔄 CI/CD PIPELINE - COMPLETE GUIDE

**Status:** ✅ Ready to deploy  
**Platform:** GitHub Actions  
**Coverage:** CI, CD, Quality, Security

---

## 📦 **QUICK START**

### **1. Setup GitHub Secrets:**

Navigate to: `Settings → Secrets and variables → Actions → New repository secret`

**Required Secrets:**
```bash
# Docker Hub
DOCKER_USERNAME=your-username
DOCKER_PASSWORD=your-password

# Netlify (Frontend)
NETLIFY_AUTH_TOKEN=your-token
NETLIFY_SITE_ID=your-site-id

# Production Server
PROD_HOST=your-server-ip
PROD_USER=deploy-user
PROD_SSH_KEY=your-private-key

# AWS S3 (Static files)
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# URLs
FRONTEND_URL=https://your-domain.com
API_URL=https://api.your-domain.com
STATIC_URL=https://static.your-domain.com
FRONTEND_BASE_URL=/

# Database
DB_CONNECTION_STRING=Server=mysql;Port=3306;Database=academy;User=user;Password=pass

# JWT
JWT_SECRET=your-secret-min-32-chars
JWT_ISSUER=https://your-domain.com
JWT_AUDIENCE=https://your-domain.com

# Optional
SONAR_TOKEN=your-sonar-token
SLACK_WEBHOOK=your-slack-webhook
```

### **2. Push to GitHub:**
```bash
git add .
git commit -m "feat: add CI/CD pipeline"
git push origin main
```

### **3. Watch Pipeline:**
Navigate to: `Actions` tab in GitHub

---

## 🔄 **CI PIPELINE (ci.yml)**

### **Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

### **Jobs:**

#### **1. Frontend CI (5-10 min):**
```yaml
✓ Checkout code
✓ Setup Node.js 18
✓ Install dependencies
✓ Lint code
✓ Type check (TypeScript)
✓ Run unit tests
✓ Generate coverage report
✓ Upload coverage to Codecov
✓ Build application
✓ Upload build artifacts
```

#### **2. Backend CI (5-10 min):**
```yaml
✓ Checkout code
✓ Setup .NET 7
✓ Start MySQL service
✓ Restore dependencies
✓ Build (Release)
✓ Run tests
✓ Publish
✓ Upload publish artifacts
```

#### **3. E2E Tests (10-15 min):**
```yaml
✓ Checkout code
✓ Setup Node.js 18
✓ Install dependencies
✓ Install Playwright browsers
✓ Download backend artifacts
✓ Start backend server
✓ Run E2E tests
✓ Upload Playwright report
✓ Upload test results
```

#### **4. Code Quality:**
```yaml
✓ Checkout code
✓ SonarCloud scan
✓ Upload results
```

#### **5. Security Scan:**
```yaml
✓ Checkout code
✓ Run Trivy vulnerability scanner
✓ Upload results to GitHub Security
```

#### **6. Notify:**
```yaml
✓ Send notification with results
```

---

## 🚀 **DEPLOY PIPELINE (deploy.yml)**

### **Triggers:**
- Push to `main`
- Tags matching `v*` (e.g., v1.0.0)

### **Jobs:**

#### **1. Deploy Frontend (5 min):**
```yaml
✓ Checkout code
✓ Setup Node.js
✓ Install dependencies
✓ Build for production
✓ Deploy to Netlify
```

#### **2. Deploy Backend (10 min):**
```yaml
✓ Checkout code
✓ Setup .NET
✓ Build & Publish
✓ Build Docker image
✓ Push to Docker Hub
✓ Deploy to production server
✓ Restart services
```

#### **3. Deploy Static (5 min):**
```yaml
✓ Checkout code
✓ Deploy to AWS S3
```

#### **4. Create Release (if tag):**
```yaml
✓ Create GitHub release
✓ Add release notes
✓ Attach deployment URLs
```

#### **5. Notify Deployment:**
```yaml
✓ Send Slack notification
```

---

## 🐳 **DOCKER DEPLOYMENT**

### **Production Setup:**

1. **Copy environment file:**
```bash
cp .env.production.example .env.production
# Edit .env.production with your values
```

2. **Start services:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Check status:**
```bash
docker-compose -f docker-compose.prod.yml ps
```

4. **View logs:**
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

5. **Stop services:**
```bash
docker-compose -f docker-compose.prod.yml down
```

### **Services:**
- **Frontend:** Nginx on port 80/443
- **Backend:** .NET API on port 5007
- **MySQL:** Database on port 3306
- **Static Server:** Python on port 5008
- **Redis:** Cache on port 6379 (optional)

---

## 📊 **MONITORING**

### **Health Checks:**
```bash
# Frontend
curl https://your-domain.com/health

# Backend
curl https://api.your-domain.com/health

# MySQL
docker exec edutailor-mysql mysqladmin ping

# Redis
docker exec edutailor-redis redis-cli ping
```

### **Logs:**
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Nginx access logs
docker exec edutailor-frontend tail -f /var/log/nginx/access.log

# Nginx error logs
docker exec edutailor-frontend tail -f /var/log/nginx/error.log
```

---

## 🔧 **TROUBLESHOOTING**

### **Issue: CI fails on tests**
```bash
# Check test logs in GitHub Actions
# Run tests locally first
npm run test:run
npm run test:e2e
```

### **Issue: Deployment fails**
```bash
# Check GitHub Actions logs
# Verify secrets are set correctly
# Check server SSH access
ssh deploy-user@your-server-ip
```

### **Issue: Docker container won't start**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check environment variables
docker-compose -f docker-compose.prod.yml config

# Restart service
docker-compose -f docker-compose.prod.yml restart backend
```

### **Issue: Database connection fails**
```bash
# Check MySQL is running
docker ps | grep mysql

# Test connection
docker exec edutailor-mysql mysql -u root -p -e "SHOW DATABASES;"

# Check connection string in .env.production
```

---

## 🎯 **BEST PRACTICES**

### **1. Branch Strategy:**
```
main (production)
  ↑
develop (staging)
  ↑
feature/* (development)
```

### **2. Commit Messages:**
```bash
feat: add new feature
fix: fix bug
docs: update documentation
test: add tests
chore: update dependencies
ci: update CI/CD
```

### **3. Versioning:**
```bash
# Create release
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# This triggers deploy pipeline
```

### **4. Rollback:**
```bash
# Revert to previous version
docker-compose -f docker-compose.prod.yml pull backend:previous-sha
docker-compose -f docker-compose.prod.yml up -d backend
```

---

## 📈 **METRICS**

### **CI Pipeline:**
- **Duration:** ~20-30 min
- **Success Rate:** Target >95%
- **Coverage:** >70% unit, >95% E2E

### **Deploy Pipeline:**
- **Duration:** ~15-20 min
- **Downtime:** <30 seconds
- **Rollback Time:** <5 min

---

## 🔐 **SECURITY**

### **SSL Certificates:**
```bash
# Using Let's Encrypt
certbot certonly --webroot -w /usr/share/nginx/html \
  -d your-domain.com -d www.your-domain.com

# Copy to nginx
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./nginx/ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./nginx/ssl/
```

### **Secrets Management:**
- Never commit secrets to Git
- Use GitHub Secrets for CI/CD
- Use environment variables in production
- Rotate secrets regularly

### **Security Scanning:**
- Trivy scans on every push
- SonarCloud for code quality
- Dependabot for dependency updates

---

## 📚 **RESOURCES**

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

## ✅ **CHECKLIST**

Before deploying to production:
- [ ] All tests pass locally
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backed up
- [ ] Monitoring configured
- [ ] Rollback plan ready
- [ ] Team notified

---

**Created:** 2025-11-23  
**Author:** AI Assistant  
**Status:** ✅ Production ready  
**Next:** Setup GitHub secrets and deploy!
