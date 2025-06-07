# 🧪 Fotek CRM - Kapsamlı Test Senaryoları

## 📊 Sistem Durumu Analizi
**Son Güncelleme**: 6 Haziran 2025  
**Test Kapsamı**: 7 Sprint (S-0 → S-7)  
**Sistem Durumu**: 🟢 **PRODUCTION READY**

### 🏗️ Tamamlanmış Sistem Bileşenleri
- ✅ **Backend API**: NestJS + TypeORM + MSSQL
- ✅ **Frontend UI**: React + Vite + Ant Design  
- ✅ **Database**: MSSQL Server 2022
- ✅ **Auth System**: JWT Bearer Tokens
- ✅ **Docker Stack**: 4 container yapısı
- ✅ **CI/CD**: GitHub Actions pipeline

### 🎯 Test Edilecek Modüller
1. **Authentication System** (S-2, S-3)
2. **Company Management** (S-4, S-5) 
3. **Contact Management** (S-6)
4. **Product Management** (S-6, S-7)
5. **Docker Infrastructure** (S-0)
6. **CI/CD Pipeline** (S-1)

---

## 🔐 1. AUTHENTICATION SYSTEM TESTLERI

### 1.1 Backend Authentication API Tests

#### Test 1.1.1: User Registration
```bash
# Test Case: Yeni kullanıcı kaydı
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@fotek.com",
    "firstName": "Test",
    "lastName": "User", 
    "password": "Test123!"
  }'

# Beklenen Sonuç: 201 Created + JWT token
# Kontrol: access_token field mevcut
# Kontrol: user object içinde password field yok
```

#### Test 1.1.2: User Login (Success)
```bash
# Test Case: Geçerli kredentiyaller ile giriş
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@fotek.com",
    "password": "Test123!"
  }'

# Beklenen Sonuç: 200 OK + JWT token
# Kontrol: access_token mevcut
# Kontrol: user object içinde email, firstName, lastName
```

#### Test 1.1.3: User Login (Failure)
```bash
# Test Case: Yanlış şifre ile giriş
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@fotek.com",
    "password": "YanlisPassword"
  }'

# Beklenen Sonuç: 401 Unauthorized
# Kontrol: "Geçersiz email veya şifre" mesajı
```

#### Test 1.1.4: Duplicate Email
```bash
# Test Case: Aynı email ile ikinci kez kayıt
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@fotek.com",
    "firstName": "Another",
    "lastName": "User", 
    "password": "Test456!"
  }'

# Beklenen Sonuç: 409 Conflict
# Kontrol: "Bu email adresi zaten kullanılıyor" mesajı
```

### 1.2 Frontend Authentication Tests

#### Test 1.2.1: Login UI Test
```bash
# Test Case: Login formu testi
# URL: http://localhost:80
# Adımlar:
# 1. Login sayfasına git
# 2. Email: testuser@fotek.com
# 3. Password: Test123!
# 4. "Giriş Yap" butonuna tıkla

# Beklenen Sonuç: Dashboard sayfasına yönlendirilme
# Kontrol: URL değişimi /login → /
# Kontrol: "Hoş geldiniz" mesajı görünüyor
# Kontrol: LocalStorage'da "fotek_auth_token" var
```

#### Test 1.2.2: Protected Routes Test
```bash
# Test Case: Korunmuş sayfa erişimi
# Adımlar:
# 1. Tarayıcıda localStorage.clear() çalıştır
# 2. http://localhost:80 adresine git

# Beklenen Sonuç: Login sayfasına yönlendirilme
# Kontrol: URL /login olmalı
# Kontrol: Login formu görünmeli
```

#### Test 1.2.3: Auto Logout Test
```bash
# Test Case: Token süresi dolması
# Adımlar:
# 1. Login ol (token al)
# 2. LocalStorage'dan token'ı sil
# 3. Herhangi bir API isteği yap

# Beklenen Sonuç: Otomatik logout
# Kontrol: Login sayfasına yönlendirilme
```

---

## 🏢 2. COMPANY MANAGEMENT TESTLERI

### 2.1 Company Backend API Tests

#### Test 2.1.1: Company Creation
```bash
# Önce login ol ve token al
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@fotek.com","password":"Test123!"}' \
  | jq -r '.access_token')

# Test Case: Yeni firma oluştur
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Firma A.Ş.",
    "email": "info@testfirma.com",
    "phone": "+90 212 555 0123",
    "industry": "Technology",
    "website": "https://testfirma.com",
    "address": "Maslak Mahallesi, Test Caddesi No:1",
    "city": "Istanbul",
    "country": "Turkey",
    "status": "lead",
    "taxNumber": "1234567890"
  }'

# Beklenen Sonuç: 201 Created
# Kontrol: company object döndürülmeli
# Kontrol: id field UUID formatında
# Kontrol: createdBy field user ID'si ile dolu
```

#### Test 2.1.2: Company List with Pagination
```bash
# Test Case: Firma listesi çekme
curl -X GET "http://localhost:3000/api/companies?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Beklenen Sonuç: 200 OK
# Kontrol: companies array mevcut
# Kontrol: pagination object mevcut (page, limit, total, pages)
# Kontrol: Her company object'inde gerekli fieldlar var
```

#### Test 2.1.3: Company Statistics
```bash
# Test Case: Firma istatistikleri
curl -X GET http://localhost:3000/api/companies/stats \
  -H "Authorization: Bearer $TOKEN"

# Beklenen Sonuç: 200 OK
# Kontrol: total, leads, prospects, customers, inactive alanları
# Kontrol: Sayısal değerler doğru
```

#### Test 2.1.4: Company Search
```bash
# Test Case: Firma arama
curl -X GET "http://localhost:3000/api/companies?search=Test" \
  -H "Authorization: Bearer $TOKEN"

# Beklenen Sonuç: 200 OK
# Kontrol: Filtrelenmiş sonuçlar
# Kontrol: "Test" kelimesini içeren firmalar
```

### 2.2 Company Frontend Tests

#### Test 2.2.1: Company List UI
```bash
# Test Case: Firma listesi UI testi
# URL: http://localhost:80
# Adımlar:
# 1. Login yap
# 2. "Firmalar" tabına tıkla
# 3. Firma listesinin yüklendiğini kontrol et

# Beklenen Sonuç: Firma listesi görünür
# Kontrol: İstatistik kartları üstte
# Kontrol: Firma tablosu altta
# Kontrol: "Yeni Firma" butonu mevcut
```

#### Test 2.2.2: Company Creation UI
```bash
# Test Case: Firma oluşturma UI
# Adımlar:
# 1. Firmalar sekmesinde "Yeni Firma" butonuna tıkla
# 2. Form modalının açıldığını kontrol et
# 3. Formu doldur ve kaydet

# Beklenen Sonuç: Yeni firma başarıyla oluşturulur
# Kontrol: Modal kapatılır
# Kontrol: Firma listesi güncellenir
# Kontrol: Başarı mesajı gösterilir
```

#### Test 2.2.3: Company Edit UI
```bash
# Test Case: Firma düzenleme
# Adımlar:
# 1. Firma listesinde bir firmaya tıkla
# 2. "Düzenle" butonuna tıkla
# 3. Bilgileri güncelle ve kaydet

# Beklenen Sonuç: Firma başarıyla güncellenir
# Kontrol: Güncellenmiş bilgiler listede görünür
```

---

## 👥 3. CONTACT MANAGEMENT TESTLERI

### 3.1 Contact Backend API Tests

#### Test 3.1.1: Contact Creation
```bash
# Test Case: Yeni kişi oluştur
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "email": "ahmet.yilmaz@testfirma.com",
    "phone": "+90 212 555 0124",
    "mobile": "+90 532 555 0124",
    "position": "İnsan Kaynakları Müdürü",
    "department": "İnsan Kaynakları",
    "type": "manager",
    "status": "active",
    "companyId": "COMPANY_ID_HERE",
    "isPrimary": true
  }'

# Beklenen Sonuç: 201 Created
# Kontrol: contact object döndürülmeli
# Kontrol: company relation dolu
```

#### Test 3.1.2: Contact Statistics
```bash
# Test Case: Kişi istatistikleri
curl -X GET http://localhost:3000/api/contacts/stats \
  -H "Authorization: Bearer $TOKEN"

# Beklenen Sonuç: 200 OK
# Kontrol: total, employees, managers, decisionMakers, active, inactive
```

#### Test 3.1.3: Company Contacts
```bash
# Test Case: Firmaya ait kişiler
curl -X GET http://localhost:3000/api/contacts/company/COMPANY_ID \
  -H "Authorization: Bearer $TOKEN"

# Beklenen Sonuç: 200 OK
# Kontrol: Sadece o firmaya ait kişiler
```

### 3.2 Contact Frontend Tests

#### Test 3.2.1: Contact List UI
```bash
# Test Case: Kişi listesi UI
# Adımlar:
# 1. "Kişiler" tabına tıkla
# 2. Kişi listesinin yüklendiğini kontrol et

# Beklenen Sonuç: Kişi listesi görünür
# Kontrol: Avatar'lı kişi listesi
# Kontrol: İstatistik dashboard'u
# Kontrol: Arama ve filtre seçenekleri
```

#### Test 3.2.2: Contact Form UI
```bash
# Test Case: Kişi oluşturma formu
# Adımlar:
# 1. "Yeni Kişi" butonuna tıkla
# 2. 5 bölümlü formun açıldığını kontrol et
# 3. Tüm bölümleri doldur

# Beklenen Sonuç: Kişi başarıyla oluşturulur
# Kontrol: Form validation çalışıyor
# Kontrol: Firma seçimi dropdown'u çalışıyor
```

---

## 📦 4. PRODUCT MANAGEMENT TESTLERI

### 4.1 Product Backend API Tests

#### Test 4.1.1: Product Creation
```bash
# Test Case: Yeni ürün oluştur
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Ürün 1",
    "code": "TEST001",
    "description": "Test ürünü açıklaması",
    "category": "electronics",
    "brand": "Test Marka",
    "listPrice": 1000.00,
    "costPrice": 750.00,
    "vatRate": 18,
    "currency": "TRY",
    "stockQuantity": 100,
    "minStockLevel": 10,
    "unit": "adet",
    "isActive": true,
    "isService": false
  }'

# Beklenen Sonuç: 201 Created
# Kontrol: product object döndürülmeli
# Kontrol: code unique constraint çalışıyor
```

#### Test 4.1.2: Product Statistics
```bash
# Test Case: Ürün istatistikleri
curl -X GET http://localhost:3000/api/products/stats \
  -H "Authorization: Bearer $TOKEN"

# Beklenen Sonuç: 200 OK
# Kontrol: totalProducts, activeProducts, lowStockProducts, outOfStockProducts
```

#### Test 4.1.3: Product Duplicate Code
```bash
# Test Case: Aynı kod ile ikinci ürün
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Ürün 2",
    "code": "TEST001",
    "listPrice": 2000.00,
    "costPrice": 1500.00
  }'

# Beklenen Sonuç: 409 Conflict
# Kontrol: "Bu ürün kodu zaten kullanılıyor" mesajı
```

### 4.2 Product Frontend Tests

#### Test 4.2.1: Product List UI
```bash
# Test Case: Ürün listesi UI
# Adımlar:
# 1. "Ürünler" tabına tıkla
# 2. Ürün listesinin yüklendiğini kontrol et

# Beklenen Sonuç: Ürün listesi görünür
# Kontrol: İstatistik kartları mevcut
# Kontrol: Ürün tablosu mevcut
# Kontrol: Fiyat formatı doğru (TRY formatında)
# Kontrol: Stok seviyeleri renk kodlu
```

#### Test 4.2.2: Product Form UI
```bash
# Test Case: Ürün oluşturma formu
# Adımlar:
# 1. "Yeni Ürün" butonuna tıkla
# 2. 4 bölümlü formun açıldığını kontrol et
# 3. Fiyat hesaplamalarının otomatik çalıştığını kontrol et

# Beklenen Sonuç: Ürün başarıyla oluşturulur
# Kontrol: Kar marjı otomatik hesaplanıyor
# Kontrol: KDV tutarı otomatik hesaplanıyor
```

---

## 🐳 5. DOCKER INFRASTRUCTURE TESTLERI

### 5.1 Container Health Tests

#### Test 5.1.1: All Containers Running
```bash
# Test Case: Tüm container'lar çalışıyor mu?
docker-compose ps

# Beklenen Sonuç: 4 container UP durumunda
# Kontrol: fotek_db (MSSQL) - Up
# Kontrol: fotek_api (NestJS) - Up  
# Kontrol: fotek_frontend (React) - Up
# Kontrol: fotek_nginx (Proxy) - Up
```

#### Test 5.1.2: Container Health Checks
```bash
# Test Case: Container sağlık kontrolü
docker-compose exec fotek_api curl http://localhost:3000/api/health

# Beklenen Sonuç: Health check response
# Kontrol: {"status":"OK","service":"Fotek CRM API"}
```

#### Test 5.1.3: Database Connection
```bash
# Test Case: Database bağlantısı
docker-compose logs fotek_api | grep -i "database\|connection"

# Beklenen Sonuç: Başarılı bağlantı logları
# Kontrol: "Database connection established"
# Kontrol: No connection errors
```

### 5.2 Network Tests

#### Test 5.2.1: Frontend Access
```bash
# Test Case: Frontend erişilebilirlik
curl -I http://localhost:80

# Beklenen Sonuç: HTTP/1.1 200 OK
# Kontrol: Content-Type: text/html
```

#### Test 5.2.2: API Access
```bash
# Test Case: API erişilebilirlik
curl -I http://localhost:3000/api/health

# Beklenen Sonuç: HTTP/1.1 200 OK
# Kontrol: Content-Type: application/json
```

#### Test 5.2.3: Nginx Proxy
```bash
# Test Case: Nginx proxy çalışması
curl -I http://localhost:80/api/health

# Beklenen Sonuç: HTTP/1.1 200 OK
# Kontrol: Nginx üzerinden API'ye erişim
```

---

## 🔄 6. INTEGRATION TESTLERI

### 6.1 Full Stack E2E Tests

#### Test 6.1.1: Complete User Journey
```bash
# Test Case: Tam kullanıcı akışı
# Manuel Test Senaryosu:

# 1. KAYIT VE GİRİŞ
# - http://localhost:80 git
# - Hesap oluştur: test2@fotek.com / Test123!
# - Giriş yap

# 2. FİRMA YÖNETİMİ  
# - Firmalar tabına git
# - Yeni firma oluştur
# - Firma listesinde görüntüle
# - Firma detayını aç

# 3. KİŞİ YÖNETİMİ
# - Kişiler tabına git  
# - Yeni kişi oluştur (oluşturulan firmaya bağla)
# - Kişi listesinde görüntüle
# - Kişi detayını aç

# 4. ÜRÜN YÖNETİMİ
# - Ürünler tabına git
# - Yeni ürün oluştur
# - Ürün listesinde görüntüle
# - Ürün detayını aç

# 5. ÇIKIŞ
# - Çıkış yap butonuna tıkla
# - Login sayfasına yönlendirildiğini kontrol et

# Beklenen Sonuç: Tüm adımlar başarılı
```

#### Test 6.1.2: Data Relationship Test
```bash
# Test Case: Veri ilişkileri
# Adımlar:
# 1. Firma oluştur (Test Firma)
# 2. Bu firmaya bağlı kişi oluştur
# 3. Kişi detayında firma bilgisinin göründüğünü kontrol et
# 4. Firma detayında kişi sayısının güncellendiğini kontrol et

# Beklenen Sonuç: İlişkiler doğru çalışıyor
```

### 6.2 Performance Tests

#### Test 6.2.1: API Response Times
```bash
# Test Case: API yanıt süreleri
time curl http://localhost:3000/api/health
time curl http://localhost:3000/api/companies/stats -H "Authorization: Bearer $TOKEN"
time curl http://localhost:3000/api/contacts/stats -H "Authorization: Bearer $TOKEN"
time curl http://localhost:3000/api/products/stats -H "Authorization: Bearer $TOKEN"

# Beklenen Sonuç: Tüm API'ler < 200ms
```

#### Test 6.2.2: Frontend Load Times
```bash
# Test Case: Frontend yükleme süreleri
# Manuel Test (Browser Developer Tools):
# 1. Network tab'ı aç
# 2. http://localhost:80 git
# 3. DOMContentLoaded süresini ölç
# 4. Load süresini ölç

# Beklenen Sonuç: 
# - DOMContentLoaded < 1000ms
# - Load < 2000ms
```

---

## 📊 7. TEST EXECUTION PLANLAMASI

### 7.1 Test Execution Order

#### Aşama 1: Infrastructure Tests (5 dakika)
1. Docker container'lar çalışıyor mu?
2. Database bağlantısı var mı?
3. Network erişimi çalışıyor mu?

#### Aşama 2: Backend API Tests (10 dakika)
1. Authentication endpoints
2. Company CRUD endpoints  
3. Contact CRUD endpoints
4. Product CRUD endpoints

#### Aşama 3: Frontend UI Tests (15 dakika)
1. Login/logout flows
2. Company management UI
3. Contact management UI
4. Product management UI

#### Aşama 4: Integration Tests (10 dakika)
1. Full stack E2E journey
2. Data relationship validation
3. Performance validation

### 7.2 Test Environment Setup

#### Prerequisites:
```bash
# 1. Docker ve Docker Compose kurulu olmalı
docker --version
docker-compose --version

# 2. Node.js ve npm kurulu olmalı (development için)
node --version
npm --version

# 3. curl komutu mevcut olmalı (API testleri için)
curl --version

# 4. jq kurulu olmalı (JSON parsing için)
jq --version
```

#### Environment Start:
```bash
# Test ortamını başlat
cd FotekCRM
docker-compose up -d

# Container'ların ayaklandığını bekle (30 saniye)
sleep 30

# Health check
curl http://localhost:3000/api/health
```

---

## 🎯 8. SUCCESS CRITERIA

### 8.1 Test Pass Criteria

#### Critical Tests (Must Pass):
- ✅ All containers running healthy
- ✅ Authentication endpoints working
- ✅ CRUD operations for all entities
- ✅ Frontend UI loads without errors
- ✅ Full E2E user journey completes

#### Important Tests (Should Pass):
- ✅ Performance benchmarks met
- ✅ Data relationships working
- ✅ UI validation working
- ✅ Search and filtering functional

### 8.2 Test Report Template

```markdown
# Test Execution Report
**Date**: [DATE]
**Tester**: [NAME]
**Environment**: Docker Localhost

## Test Summary
- Total Tests: X
- Passed: Y
- Failed: Z
- Pass Rate: %

## Failed Tests (if any)
[List failed tests with details]

## Performance Metrics
- API Response Time: Xms
- Frontend Load Time: Xms
- Database Query Time: Xms

## Recommendations
[Any improvement suggestions]
```

---

## 🚀 9. AUTOMATED TEST SCRIPT

### 9.1 Quick Test Runner Script

```bash
#!/bin/bash
# test_runner.sh - Fotek CRM Quick Test Suite

echo "🧪 Fotek CRM Test Suite Started"
echo "================================"

# Infrastructure Tests
echo "1. Testing Infrastructure..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Containers are running"
else
    echo "❌ Containers not running"
    exit 1
fi

# API Health Check
echo "2. Testing API Health..."
if curl -s http://localhost:3000/api/health | grep -q "OK"; then
    echo "✅ API Health OK"
else
    echo "❌ API Health Failed"
    exit 1
fi

# Frontend Check
echo "3. Testing Frontend..."
if curl -s -I http://localhost:80 | grep -q "200 OK"; then
    echo "✅ Frontend accessible"
else
    echo "❌ Frontend not accessible"
    exit 1
fi

echo "🎉 All critical tests passed!"
```

Bu test suite'i kullanarak sisteminizin her zaman çalışır durumda olduğunu garantileyebilirsiniz. 