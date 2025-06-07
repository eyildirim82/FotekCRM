# 🧪 Fotek CRM - Manuel Test Rehberi (Windows)

## 📊 Test Özeti
**Sistem Durumu**: 7 Sprint tamamlanmış (S-0 → S-7)  
**Test Kapsamı**: Full-stack CRM sistemi  
**Ortam**: Windows + Docker  
**Son Güncelleme**: 6 Haziran 2025

## 🚀 Hızlı Test Başlangıcı

### Ön Gereksinimler
```powershell
# Docker kontrol
docker --version
docker-compose --version

# Sistem başlatma
docker-compose up -d

# Container durumu kontrol
docker-compose ps
```

### Temel Sistem Kontrolü
```powershell
# API Health Check
Invoke-RestMethod -Uri "http://localhost:3000/api/health"

# Frontend Erişim
Invoke-WebRequest -Uri "http://localhost:80" -Method Head
```

---

## 🔐 1. AUTHENTICATION TESTLERI

### Test 1.1: User Registration (API)
```powershell
$registerData = @{
    email = "testuser@fotek.com"
    firstName = "Test"
    lastName = "User"
    password = "Test123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $registerData

# Kontrol: $response.access_token mevcut mu?
Write-Host "Token alındı: $($response.access_token -ne $null)"
```

### Test 1.2: User Login (API)
```powershell
$loginData = @{
    email = "testuser@fotek.com"
    password = "Test123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginData

$token = $loginResponse.access_token
Write-Host "Login başarılı: $($token -ne $null)"
```

### Test 1.3: Frontend Login Flow
**Manuel Test Adımları:**
1. Tarayıcıda `http://localhost:80` aç
2. "Kayıt Ol" sekmesine tıkla
3. Form doldur ve hesap oluştur
4. "Giriş Yap" sekmesine geç
5. Oluşturulan hesapla giriş yap
6. Dashboard'a yönlendirildiğini kontrol et

**Beklenen Sonuç:**
- ✅ Başarılı kayıt → JWT token
- ✅ Başarılı giriş → Dashboard sayfası
- ✅ LocalStorage'da token var

---

## 🏢 2. COMPANY MANAGEMENT TESTLERI

### Test 2.1: Company CRUD API
```powershell
# Company Statistics
$headers = @{ "Authorization" = "Bearer $token" }
$companyStats = Invoke-RestMethod -Uri "http://localhost:3000/api/companies/stats" -Headers $headers
Write-Host "Company stats: Total=$($companyStats.total)"

# Company Creation
$companyData = @{
    name = "Test Firma A.Ş."
    email = "info@testfirma.com"
    phone = "+90 212 555 0123"
    industry = "Technology"
    website = "https://testfirma.com"
    address = "Maslak Mahallesi, Test Caddesi No:1"
    city = "Istanbul"
    country = "Turkey"
    status = "lead"
    taxNumber = "1234567890"
} | ConvertTo-Json

$newCompany = Invoke-RestMethod -Uri "http://localhost:3000/api/companies" `
    -Method POST `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $companyData

Write-Host "Firma oluşturuldu: ID=$($newCompany.id)"
$companyId = $newCompany.id
```

### Test 2.2: Company Frontend UI
**Manuel Test Adımları:**
1. Dashboard'da "Firmalar" tabına tıkla
2. İstatistik kartlarının yüklendiğini kontrol et
3. Firma tablosunun göründüğünü kontrol et
4. "Yeni Firma" butonuna tıkla
5. Modal formun açıldığını kontrol et
6. Tüm alanları doldur ve kaydet
7. Yeni firmanın listede göründüğünü kontrol et

**Kontrol Listesi:**
- ✅ İstatistik kartları doğru
- ✅ Firma tablosu yükleniyor
- ✅ Arama fonksiyonu çalışıyor
- ✅ Form validation aktif
- ✅ CRUD operasyonları çalışıyor

---

## 👥 3. CONTACT MANAGEMENT TESTLERI

### Test 3.1: Contact CRUD API
```powershell
# Contact Statistics
$contactStats = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts/stats" -Headers $headers
Write-Host "Contact stats: Total=$($contactStats.total)"

# Contact Creation
$contactData = @{
    firstName = "Ahmet"
    lastName = "Yılmaz"
    email = "ahmet.yilmaz@testfirma.com"
    phone = "+90 212 555 0124"
    mobile = "+90 532 555 0124"
    position = "İnsan Kaynakları Müdürü"
    department = "İnsan Kaynakları"
    type = "manager"
    status = "active"
    companyId = $companyId
    isPrimary = $true
} | ConvertTo-Json

$newContact = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts" `
    -Method POST `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $contactData

Write-Host "Kişi oluşturuldu: ID=$($newContact.id)"
```

### Test 3.2: Contact Frontend UI
**Manuel Test Adımları:**
1. Dashboard'da "Kişiler" tabına tıkla
2. İstatistik dashboard'unun yüklendiğini kontrol et
3. Kişi tablosunun avatar'larla göründüğünü kontrol et
4. "Yeni Kişi" butonuna tıkla
5. 5 bölümlü formun açıldığını kontrol et
6. Firma dropdown'undan firma seç
7. Tüm gerekli alanları doldur ve kaydet
8. Yeni kişinin listede göründüğünü kontrol et

**Kontrol Listesi:**
- ✅ 6 istatistik kartı doğru
- ✅ Avatar'lı kişi listesi
- ✅ Email/telefon linkleri çalışıyor
- ✅ Firma entegrasyonu aktif
- ✅ 5 bölümlü form çalışıyor

---

## 📦 4. PRODUCT MANAGEMENT TESTLERI

### Test 4.1: Product CRUD API
```powershell
# Product Statistics
$productStats = Invoke-RestMethod -Uri "http://localhost:3000/api/products/stats" -Headers $headers
Write-Host "Product stats: Total=$($productStats.totalProducts)"

# Product Creation
$productData = @{
    name = "Test Ürün 1"
    code = "TEST001"
    description = "Test ürünü açıklaması"
    category = "electronics"
    brand = "Test Marka"
    listPrice = 1000.00
    costPrice = 750.00
    vatRate = 18
    currency = "TRY"
    stockQuantity = 100
    minStockLevel = 10
    unit = "adet"
    isActive = $true
    isService = $false
} | ConvertTo-Json

$newProduct = Invoke-RestMethod -Uri "http://localhost:3000/api/products" `
    -Method POST `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $productData

Write-Host "Ürün oluşturuldu: ID=$($newProduct.id)"
```

### Test 4.2: Product Frontend UI
**Manuel Test Adımları:**
1. Dashboard'da "Ürünler" tabına tıkla
2. İstatistik kartlarının yüklendiğini kontrol et
3. Ürün tablosunun fiyat formatlarıyla göründüğünü kontrol et
4. "Yeni Ürün" butonuna tıkla
5. 4 bölümlü formun açıldığını kontrol et
6. Fiyat hesaplamalarının otomatik çalıştığını kontrol et
7. Tüm alanları doldur ve kaydet
8. Yeni ürünün listede göründüğünü kontrol et

**Kontrol Listesi:**
- ✅ 4 istatistik kartı doğru
- ✅ Fiyat formatları (TRY) doğru
- ✅ Stok seviye renkleri aktif
- ✅ Kar marjı otomatik hesaplama
- ✅ 4 bölümlü form çalışıyor

---

## 🐳 5. DOCKER INFRASTRUCTURE TESTLERI

### Test 5.1: Container Health Check
```powershell
# Container Durumu
docker-compose ps

# Her container için log kontrol
docker-compose logs fotek_db --tail 5
docker-compose logs fotek_api --tail 5
docker-compose logs fotek_frontend --tail 5
docker-compose logs fotek_nginx --tail 5
```

### Test 5.2: Network Connectivity
```powershell
# Frontend Direct Access
Invoke-WebRequest -Uri "http://localhost:5173" -Method Head

# API Direct Access
Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method Head

# Nginx Proxy Access
Invoke-WebRequest -Uri "http://localhost:80" -Method Head
Invoke-WebRequest -Uri "http://localhost:80/api/health" -Method Head
```

**Beklenen Sonuçlar:**
- ✅ 4 container "Up" durumunda
- ✅ Tüm network endpoint'leri 200 OK
- ✅ Proxy routing çalışıyor

---

## 🔄 6. INTEGRATION TESTLERI

### Test 6.1: Full Stack E2E Test
**Komplet Kullanıcı Senaryosu:**

1. **Sistem Başlatma:**
   ```powershell
   docker-compose up -d
   Start-Sleep -Seconds 30
   ```

2. **Kayıt ve Giriş:**
   - http://localhost:80 aç
   - Yeni hesap oluştur
   - Giriş yap
   - Dashboard'a yönlendirildiğini kontrol et

3. **Firma Yönetimi:**
   - "Firmalar" tabına git
   - Yeni firma oluştur
   - Firma detayını görüntüle

4. **Kişi Yönetimi:**
   - "Kişiler" tabına git
   - Yeni kişi oluştur (oluşturulan firmaya bağla)
   - Kişi detayında firma bilgisinin göründüğünü kontrol et

5. **Ürün Yönetimi:**
   - "Ürünler" tabına git
   - Yeni ürün oluştur
   - Fiyat hesaplamalarının doğru çalıştığını kontrol et

6. **Çıkış:**
   - Çıkış yap
   - Login sayfasına yönlendirildiğini kontrol et

### Test 6.2: Data Relationship Validation
```powershell
# Company-Contact İlişkisi Kontrolü
$companyContacts = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts/company/$companyId" -Headers $headers
Write-Host "Firmaya ait kişi sayısı: $($companyContacts.count)"

# İstatistik Güncelleme Kontrolü
$updatedStats = Invoke-RestMethod -Uri "http://localhost:3000/api/companies/stats" -Headers $headers
Write-Host "Güncel firma sayısı: $($updatedStats.total)"
```

---

## ⚡ 7. PERFORMANCE TESTLERI

### Test 7.1: API Response Times
```powershell
# API yanıt sürelerini ölç
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

Invoke-RestMethod -Uri "http://localhost:3000/api/health" | Out-Null
$healthTime = $stopwatch.ElapsedMilliseconds

$stopwatch.Restart()
Invoke-RestMethod -Uri "http://localhost:3000/api/companies/stats" -Headers $headers | Out-Null
$companyStatsTime = $stopwatch.ElapsedMilliseconds

$stopwatch.Restart()
Invoke-RestMethod -Uri "http://localhost:3000/api/contacts/stats" -Headers $headers | Out-Null
$contactStatsTime = $stopwatch.ElapsedMilliseconds

Write-Host "API Response Times:"
Write-Host "Health: ${healthTime}ms"
Write-Host "Company Stats: ${companyStatsTime}ms"
Write-Host "Contact Stats: ${contactStatsTime}ms"

# Beklenen: Tüm API'ler < 200ms
```

### Test 7.2: Frontend Load Times
**Manuel Test (Browser Developer Tools):**
1. F12 ile Developer Tools aç
2. Network tab'ına git
3. http://localhost:80 yeniden yükle
4. DOMContentLoaded süresini ölç
5. Load süresini ölç

**Beklenen Sonuçlar:**
- ✅ DOMContentLoaded < 1000ms
- ✅ Load < 2000ms

---

## 📊 8. TEST SONUÇ ŞABLONU

```markdown
# Fotek CRM Test Raporu
**Tarih**: [TARIH]
**Test Eden**: [İSİM]
**Ortam**: Windows Docker Localhost

## Test Özeti
- Toplam Test: X
- Başarılı: Y  
- Başarısız: Z
- Başarı Oranı: %XX

## Infrastructure
- ✅/❌ Container'lar çalışıyor
- ✅/❌ Database bağlantısı
- ✅/❌ Network erişimi

## Authentication
- ✅/❌ Kayıt API
- ✅/❌ Giriş API
- ✅/❌ Frontend login flow

## Company Management  
- ✅/❌ Company CRUD API
- ✅/❌ Company Frontend UI
- ✅/❌ Company statistics

## Contact Management
- ✅/❌ Contact CRUD API
- ✅/❌ Contact Frontend UI
- ✅/❌ Contact-Company ilişkisi

## Product Management
- ✅/❌ Product CRUD API
- ✅/❌ Product Frontend UI
- ✅/❌ Product calculations

## Performance
- API Response Time: Xms
- Frontend Load Time: Xms

## Öneriler
[İyileştirme önerileri]
```

---

## 🎯 9. CRITICAL PATH TEST

### Minimum Viable Test (5 dakika)
```powershell
# Hızlı sistem kontrolü
Write-Host "🧪 Fotek CRM Hızlı Test"

# 1. Container check
if ((docker-compose ps | Select-String "Up").Count -eq 4) {
    Write-Host "✅ Containers OK"
} else {
    Write-Host "❌ Container problemi"
}

# 2. API Health
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health"
    if ($health.status -eq "OK") {
        Write-Host "✅ API OK"
    }
} catch {
    Write-Host "❌ API problemi"
}

# 3. Frontend Access
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:80" -Method Head
    if ($frontend.StatusCode -eq 200) {
        Write-Host "✅ Frontend OK"
    }
} catch {
    Write-Host "❌ Frontend problemi"
}

Write-Host "🎉 Hızlı test tamamlandı"
```

---

## 🚀 10. TROUBLESHOOTING

### Yaygın Sorunlar ve Çözümler

#### Problem 1: Container'lar başlamıyor
```powershell
# Çözüm:
docker-compose down
docker-compose pull
docker-compose up -d --build
```

#### Problem 2: API 500 hatası
```powershell
# Log kontrol:
docker-compose logs fotek_api
# Database bağlantısı kontrol et
```

#### Problem 3: Frontend yüklenmiyor
```powershell
# Frontend rebuild:
docker-compose up fotek_frontend --build
```

#### Problem 4: Database bağlantı hatası
```powershell
# Database restart:
docker-compose restart fotek_db
Start-Sleep -Seconds 20
docker-compose restart fotek_api
```

---

**Test Rehberi Sonu**  
**Fotek CRM v1.0 - Production Ready System** ✅ 