# 🚀 Fotek CRM MVP

Fotek CRM projesinin Minimum Viable Product (MVP) versiyonudur. Bu proje atomic sprint planına göre geliştirilmektedir.

## 📋 S-1 Sprint: CI Pipeline

### ✅ Tamamlanan Özellikler (S-0 + S-1)
- Docker Compose yapılandırması (db, api, frontend, nginx)
- NestJS API backend `/health` endpoint ile
- React Vite frontend "Hello CRM" sayfası
- MSSQL veritabanı
- Nginx reverse proxy
- **GitHub Actions CI Pipeline**
- **Jest Unit Testleri**
- **Docker Build & Push otomasyonu**
- **ESLint yapılandırması**

### 🏗️ Teknoloji Stack
- **Backend**: NestJS + TypeScript
- **Frontend**: React + Vite + TypeScript + Ant Design
- **Database**: Microsoft SQL Server
- **Reverse Proxy**: Nginx
- **Containerization**: Docker + Docker Compose

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Docker Desktop
- Git

### Kurulum

1. **Projeyi klonlayın:**
   ```bash
   git clone <repository-url>
   cd FotekCRM
   ```

2. **Docker Compose ile servisleri başlatın:**
   ```bash
   docker compose up --build
   ```

3. **Servislerin durumunu kontrol edin:**
   - Frontend: http://localhost:80
   - API Health: http://localhost:3000/api/health
   - Database: localhost:1433

### 🧪 Test Etme

#### Manuel Test Adımları:

1. **Frontend Kontrolü:**
   - http://localhost:80 adresine gidin
   - "Fotek CRM" başlığını görmeli
   - "API Durumunu Kontrol Et" butonuna tıklayın

2. **API Health Check:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Beklenen yanıt:
   ```json
   {
     "status": "OK",
     "timestamp": "2025-01-05T...",
     "service": "Fotek CRM API",
     "version": "1.0.0",
     "environment": "development"
   }
   ```

3. **Database Bağlantısı:**
   ```bash
   docker exec -it fotek_db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'FotekCRM2025!'
   ```

4. **Container Durumları:**
   ```bash
   docker compose ps
   ```
   Tüm servisler "healthy" durumda olmalı.

### 🔍 Servis Portları
- **Frontend**: 5173 (container), 80 (nginx proxy)
- **API**: 3000
- **Database**: 1433
- **Nginx**: 80, 443

### 📂 Proje Yapısı
```
FotekCRM/
├── docker-compose.yml
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   └── app.service.ts
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   └── App.css
│   ├── package.json
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
└── docs/
```

## 🎯 Done Kriterleri (S-0)
- ✅ `docker compose up` komutu çalışıyor
- ✅ Frontend http://localhost:80 adresinde erişilebilir
- ✅ API `/health` endpoint'i 200 döndürüyor
- ✅ Tüm servisler container'da çalışıyor

## 🔄 Gelecek Sprint'ler
Atomic Sprint Plan'a göre sonraki sprint'ler:
- **S-1**: Firma ve iletişim modülleri
- **S-2**: Fotoğraf yönetimi
- **S-3**: Firma detay sayfası
- **S-4**: Müşteri takip sistemı

## 🛠️ Geliştirme

### Backend Geliştirme
```bash
cd backend
npm install
npm run start:dev
```

### Frontend Geliştirme
```bash
cd frontend
npm install
npm run dev
```

## 📊 İzleme ve Loglama
- Container logları: `docker compose logs [service-name]`
- API logları: `docker compose logs api`
- Database logları: `docker compose logs db`

---

**Fotek CRM MVP - S-0 Sprint Tamamlandı! 🎉** 