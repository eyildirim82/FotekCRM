# 🧪 FotekCRM Test Execution Guide

Bu rehber, FotekCRM projesi için oluşturulmuş kapsamlı test senaryolarının nasıl çalıştırılacağını açıklar.

## 📋 Test Türleri ve Kapsamları

### 1. **Unit Tests** (Birim Testleri)
- **Kapsam**: Backend service metodları, utility functions
- **Araçlar**: Jest, @nestjs/testing
- **Süre**: ~2-5 dakika
- **Coverage Target**: %80+

### 2. **Integration Tests** (Entegrasyon Testleri)
- **Kapsam**: API endpoints, database işlemleri
- **Araçlar**: Supertest, Test Database
- **Süre**: ~5-10 dakika
- **Coverage Target**: %95+ API endpoints

### 3. **E2E Tests** (Uçtan Uca Testler)
- **Kapsam**: Tam kullanıcı senaryoları, UI flows
- **Araçlar**: Playwright
- **Süre**: ~10-15 dakika
- **Coverage Target**: %90+ kritik user journeys

### 4. **Performance Tests** (Performans Testleri)
- **Kapsam**: API response times, load handling
- **Araçlar**: Özel PowerShell scripts
- **Süre**: ~3-5 dakika
- **Target**: <200ms average response time

### 5. **Security Tests** (Güvenlik Testleri)
- **Kapsam**: SQL Injection, XSS, Auth bypass
- **Araçlar**: Özel security test scripts
- **Süre**: ~2-3 dakika
- **Target**: Tüm güvenlik kontrolleri geçmeli

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler

1. **Docker Desktop** kurulu ve çalışır durumda
2. **Node.js 18+** ve **npm** kurulu
3. **PowerShell** (Windows için)
4. **Git** repository clonlanmış

### Sistem Hazırlığı

```bash
# 1. Bağımlılıkları yükle
npm run install:all

# 2. Docker servislerini başlat
docker compose up -d

# 3. Servislerin hazır olmasını bekle
timeout 60

# 4. Environment variables'ları ayarla
cp .env.example .env
# .env dosyasındaki DB_PASSWORD ve JWT_SECRET'ı ayarla
```

## 📊 Test Execution

### Seçenek 1: Kapsamlı Test Runner (Önerilen)

```powershell
# Tüm testleri coverage ve raporlarla çalıştır
.\test-runner-comprehensive.ps1 -TestType all -Coverage -Report

# Sadece belirli test türlerini çalıştır
.\test-runner-comprehensive.ps1 -TestType unit
.\test-runner-comprehensive.ps1 -TestType integration
.\test-runner-comprehensive.ps1 -TestType e2e
.\test-runner-comprehensive.ps1 -TestType performance
.\test-runner-comprehensive.ps1 -TestType security
```

### Seçenek 2: NPM Scripts

```bash
# Unit testler
npm run test
npm run test:coverage
npm run test:watch

# Integration testler
npm run test:integration

# E2E testler
npm run test:e2e
npm run test:e2e:headed  # Browser ile görsel
npm run test:e2e:debug   # Debug mode

# Frontend testler
npm run test:frontend
```

### Seçenek 3: Manuel Test Adımları

#### Authentication Testi
```bash
# Kullanıcı kaydı
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@fotek.com",
    "firstName": "Test",
    "lastName": "User",
    "password": "StrongPassword123!"
  }'

# Giriş
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@fotek.com",
    "password": "StrongPassword123!"
  }'
```

#### Company Management Testi
```bash
# Token alın (yukarıdaki login response'undan)
TOKEN="your-jwt-token-here"

# Yeni firma oluştur
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Teknoloji A.Ş.",
    "email": "info@testteknoloji.com",
    "phone": "+90 212 555 0123",
    "status": "lead"
  }'

# Firma listesi
curl -X GET "http://localhost:3000/api/companies?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

## 🎯 Test Senaryoları Detayı

### Authentication Test Scenarios
- ✅ Başarılı kullanıcı kaydı
- ✅ Zayıf şifre kontrolü
- ✅ Duplicate email kontrolü
- ✅ Başarılı giriş
- ✅ Yanlış kredentiyaller
- ✅ Protected routes kontrolü
- ✅ Token expiry testi
- ✅ SQL Injection önleme
- ✅ XSS Protection

### Company Management Test Scenarios
- ✅ CRUD işlemleri (Create, Read, Update, Delete)
- ✅ Pagination ve searching
- ✅ Firma istatistikleri
- ✅ Filtering ve sorting
- ✅ Data validation
- ✅ Authorization kontrolleri

### Complete Business Flow Test Scenarios
- ✅ Lead'den Customer'a tam yaşam döngüsü
- ✅ Firma → Kişi → Ürün → Sipariş → Fatura akışı
- ✅ Dashboard analytics güncellemesi
- ✅ Stok yönetimi
- ✅ Multi-currency desteği

### Performance Test Scenarios
- ✅ API response time testleri
- ✅ Pagination performance
- ✅ Search performance
- ✅ Concurrent user simulation
- ✅ Database query optimization

### UI/UX Test Scenarios
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Accessibility (WCAG compliance)
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Form validation
- ✅ Error handling

## 📈 Test Results & Reporting

### Coverage Reports
```bash
# Unit test coverage
open coverage/lcov-report/index.html

# E2E test reports
npm run test:e2e:report
```

### CI/CD Integration
```yaml
# GitHub Actions workflow örneği
name: Test Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm ci
          docker compose up -d
          sleep 60
          npm run test:all
```

## 🔍 Troubleshooting

### Common Issues

#### Docker Services Not Running
```bash
# Kontrol et
docker compose ps

# Yeniden başlat
docker compose down
docker compose up -d
```

#### Database Connection Issues
```bash
# DB logs kontrol et
docker compose logs fotek_db

# Manual connection test
docker exec -it fotek_db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD"
```

#### Test Timeouts
```bash
# Longer timeout için
npm run test -- --testTimeout=30000

# E2E için
npm run test:e2e -- --timeout=60000
```

#### Port Conflicts
```bash
# Kullanılan portları kontrol et
netstat -an | findstr ":3000"
netstat -an | findstr ":5173"
netstat -an | findstr ":1433"
```

### Debug Mode

```bash
# Jest debug
node --inspect-brk node_modules/.bin/jest --runInBand

# Playwright debug
npm run test:e2e:debug

# API logs
docker compose logs -f fotek_api
```

## 📝 Test Data Management

### Test Database Setup
```sql
-- Test veritabanı oluştur
CREATE DATABASE fotek_test;

-- Test data seed
INSERT INTO users (email, firstName, lastName, password) 
VALUES ('admin@fotek.com', 'Admin', 'User', 'hashedpassword');
```

### Test Data Cleanup
```bash
# E2E testler sonrası cleanup
npm run test:cleanup

# Manuel cleanup
docker exec fotek_db sqlcmd -S localhost -U sa -P "$DB_PASSWORD" -Q "DELETE FROM companies WHERE name LIKE '%Test%'"
```

## 🎯 Best Practices

### Test Yazarken
1. **Descriptive test names** kullanın (Türkçe açıklamalar)
2. **data-testid** attribute'ları kullanın UI elementleri için
3. **beforeEach/afterEach** ile test isolation sağlayın
4. **Mock external dependencies** when necessary
5. **Test edge cases** ve error scenarios

### Test Maintenance
1. **Failed testleri hemen fix edin**
2. **Flaky testleri identify ve stabilize edin**
3. **Test coverage'ı sürekli monitor edin**
4. **Performance regressions'ı takip edin**
5. **Test documentation'ı güncel tutun**

## 📊 Success Metrics

### Kabul Kriterleri
- **Unit Test Coverage**: ≥80%
- **Integration Test Pass Rate**: ≥95%
- **E2E Test Pass Rate**: ≥90%
- **API Response Time**: <200ms (95th percentile)
- **Page Load Time**: <3 seconds
- **Security Tests**: %100 pass

### Monitoring
```bash
# Test metrics tracking
npm run test:metrics

# Performance baseline
npm run test:performance:baseline

# Security scan
npm run test:security:full
```

---

## 📞 Support

Test senaryoları ile ilgili sorular için:
- **Documentation**: Bu README dosyası
- **Issues**: GitHub Issues kullanın
- **Team**: Development team ile iletişime geçin

**Not**: Test senaryoları sürekli güncellenmektedir. Yeni feature'lar eklendikçe ilgili test senaryoları da eklenmektedir. 