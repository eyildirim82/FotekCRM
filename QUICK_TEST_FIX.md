# 🔧 Quick Test Fix - FotekCRM

## Problem Özeti
Test çalıştırırken karşılaşılan ana problemler:

1. **Services not ready** - Docker servisleri hazır değil
2. **Auth token error** - Response yapısı yanlış parse ediliyor
3. **Jest deprecated warning** - Jest config problemi

## 🚀 Hızlı Çözüm Adımları

### Adım 1: Docker Servisleri Başlat
```bash
# Terminal'de şunları sırayla çalıştır:
docker compose down
docker compose up -d

# 60 saniye bekle (servislerin tam olarak başlaması için)
timeout 60

# Servislerin durumunu kontrol et:
docker compose ps
curl http://localhost:3000/api/health
```

### Adım 2: Test Çalıştır (Düzeltilmiş Script)
```powershell
# Bu yeni script'i kullan:
.\test-fix-and-runner.ps1

# Veya sadece integration testler için:
.\test-fix-and-runner.ps1 -TestType integration

# Problemleri otomatik düzelt:
.\test-fix-and-runner.ps1 -Fix
```

## 🔍 Manuel Test Kontrolü

### Auth Token Test
```bash
# Register test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manual-test@fotek.com",
    "firstName": "Manual",
    "lastName": "Test",
    "password": "ManualTest123!"
  }'

# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manual-test@fotek.com",
    "password": "ManualTest123!"
  }'

# Response should have "access_token" field (NOT "data.token")
```

### Company API Test
```bash
# Use the token from login response
TOKEN="your-access-token-here"

curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Manual Test Company",
    "email": "manual@testcompany.com",
    "status": "lead"
  }'
```

## 📝 Test Dosyası Düzeltmeleri

### 1. Auth Token Fix (✅ Düzeltildi)
```typescript
// tests/contact-integration.test.ts - DOĞRU VERSIYONU:
const loginResponse = await axios.post(`${API_URL}/auth/login`, testUser);
authToken = loginResponse.data.access_token; // ✅ DOĞRU

// YANLIŞTI:
// authToken = loginResponse.data.data.token; // ❌ YANLIŞ
```

### 2. Jest Config Fix (✅ Düzeltildi)
```typescript
// jest.config.ts - YENİ VERSIYONU:
transform: {
  '^.+\\.ts$': ['ts-jest', {
    tsconfig: '<rootDir>/tsconfig.json'
  }]
}

// ESKİ (deprecated) VERSIYONU:
// globals: { 'ts-jest': { tsconfig: '...' } }
```

## 🔄 Tam Test Cycle

```powershell
# 1. Docker'ı yeniden başlat
docker compose down && docker compose up -d

# 2. 60 saniye bekle
Start-Sleep 60

# 3. API'yi kontrol et
Invoke-RestMethod http://localhost:3000/api/health

# 4. Testleri çalıştır
.\test-fix-and-runner.ps1 -TestType integration -Fix
```

## 🎯 Beklenen Sonuç

Başarılı test çıktısı şöyle olmalı:
```
✅ Docker servisleri çalışıyor
✅ API servisi hazır
✅ Authentication çalışıyor - Token alındı
✅ Test veritabanı temizlendi
✅ integration testleri başarıyla tamamlandı
🎉 Testler Başarıyla Tamamlandı!
```

## 🔍 Hala Problem Varsa

### Debug Komutları:
```bash
# API loglarını kontrol et:
docker compose logs fotek_api

# Database loglarını kontrol et:
docker compose logs fotek_db

# Container durumlarını kontrol et:
docker compose ps

# Manual API test:
curl -v http://localhost:3000/api/health
```

### Common Issues:
1. **Port 3000 kullanımda**: `netstat -an | findstr ":3000"`
2. **Database bağlantı problemi**: Environment variables kontrol et
3. **JWT secret eksik**: `.env` dosyasını kontrol et

## 📞 Hızlı Yardım

En yaygın problemler ve çözümleri:

| Problem | Çözüm |
|---------|-------|
| "Services not ready" | `docker compose restart` |
| "Cannot read token" | Token'ı `response.data.access_token` olarak al |
| "404 on API calls" | `/api` prefix'ini kontrol et |
| "401 Unauthorized" | Bearer token formatını kontrol et |

Bu adımları takip ederek testleriniz çalışmaya başlamalı! 🚀 