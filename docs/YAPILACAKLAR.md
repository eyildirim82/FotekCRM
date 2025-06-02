# 📋 Fotek CRM v1.0 - Adım Adım Yapılacaklar Listesi

Bu belge, SRS v1.0 ve DSD v1.0 belgelerine dayanarak hazırlanmış kapsamlı bir proje planıdır.

## 🏗️ **Faz 1: Proje Altyapısı ve Kurulum**

### 1.1 Geliştirme Ortamı Hazırlığı
- [ ] Docker ve Docker Compose kurulumu
- [ ] Node.js 18+ ve npm kurulumu
- [ ] Git repository oluşturma ve initial commit
- [ ] Proje klasör yapısını oluşturma:
  ```
  FotekCRM/
  ├── backend/          # NestJS API
  ├── frontend/         # React + Vite
  ├── database/         # MSSQL scripts
  ├── docker/           # Docker configs
  ├── docs/            # Belgeler
  ├── scripts/         # Deployment ve utility scripts
  └── tests/           # Test dosyaları
  ```
- [ ] EditorConfig ve Prettier konfigürasyonu
- [ ] ESLint ve TypeScript ayarları

### 1.2 Docker Altyapısı
- [ ] `docker-compose.yml` dosyası oluşturma
- [ ] MSSQL 2022 container konfigürasyonu
- [ ] Nginx reverse proxy ayarları (TLS 1.3)
- [ ] Ollama LLM container yapılandırması
- [ ] Environment değişkenleri (.env files)
- [ ] Volume mapping ve network ayarları
- [ ] Health check konfigürasyonları

## 🗄️ **Faz 2: Veritabanı Tasarımı**

### 2.1 Veritabanı Şeması
- [ ] MSSQL veritabanı oluşturma scripts
- [ ] Ana tablolar oluşturma:
  - [ ] `User` tablosu (kimlik doğrulama)
  - [ ] `Customer` tablosu (müşteri bilgileri)
  - [ ] `Product` tablosu (ana ürün bilgileri)
  - [ ] `ProductVariant` tablosu (renk, beden, kapasite)
  - [ ] `Order` ve `OrderLine` tabloları
  - [ ] `Invoice` ve `InvoiceLine` tabloları
  - [ ] `CreditNote` ve `CreditNoteLine` tabloları
  - [ ] `ReturnOrder` ve `ReturnLine` tabloları
  - [ ] `ReturnReason` tablosu (kullanıcı tanımlı)
  - [ ] `StockTransaction` tablosu
  - [ ] `AuditLog` tablosu (sınırsız saklama)
  - [ ] `CurrencyRate` tablosu (TCMB kur bilgileri)
- [ ] İndeksler ve foreign key constraints
- [ ] Stored procedures (performance kritik işlemler için)
- [ ] Seed data ve test verileri

### 2.2 Veritabanı Güvenlik
- [ ] Database user ve role tanımları
- [ ] Connection string şifreleme
- [ ] Backup stratejisi implementasyonu

## 🔐 **Faz 3: Backend API (NestJS) - Sprint 1**

### 3.1 Proje İskeleti
- [ ] NestJS projesi oluşturma (`@nestjs/cli`)
- [ ] TypeORM konfigürasyonu ve MSSQL bağlantısı
- [ ] Validation pipes (class-validator)
- [ ] Global exception filter
- [ ] Swagger API documentation setup
- [ ] Logger konfigürasyonu

### 3.2 Authentication Module
- [ ] JWT strategy implementasyonu (8 saat token süresi)
- [ ] User entity ve service
- [ ] Login/logout endpoints
- [ ] Refresh token mechanism
- [ ] Role-based guards (Satış:3, Muhasebe:2, Yönetici:1)
- [ ] Password hashing (bcrypt)
- [ ] Rate limiting (brute force protection)

### 3.3 Product Module
- [ ] Product entity ve service
- [ ] ProductVariant entity ve service
- [ ] CRUD endpoints (`/api/products`, `/api/variants`)
- [ ] Üç seviyeli varyant hiyerarşisi (renk, beden, kapasite)
- [ ] Product search ve filtering
- [ ] Pagination implementasyonu

### 3.4 TCMB Kur Servisi
- [ ] TCMB XML parser (today.xml şeması)
- [ ] Cron job konfigürasyonu (00:05 Europe/Istanbul)
- [ ] CurrencyRate entity ve service
- [ ] Kur güncelleme endpoint
- [ ] Offline durumda loglama

### 3.5 Audit System
- [ ] AuditInterceptor implementasyonu
- [ ] Before/after data tracking
- [ ] AuditLog entity ve service
- [ ] KVKK uyumluluk (sınırsız saklama)

## 🎨 **Faz 4: Frontend (React + Vite) - Sprint 1**

### 4.1 Proje Kurulumu
- [ ] Vite + React + TypeScript setup
- [ ] UI kütüphanesi seçimi ve kurulumu (Ant Design önerisi)
- [ ] React Router v6 konfigürasyonu
- [ ] Axios HTTP client setup (interceptors ile)
- [ ] State management (Redux Toolkit/Zustand)

### 4.2 Authentication Pages
- [ ] Login sayfası tasarımı
- [ ] JWT token yönetimi (localStorage/sessionStorage)
- [ ] Protected routes implementasyonu
- [ ] User context/state management
- [ ] Auto-logout (token expiry)

### 4.3 Layout ve Navigation
- [ ] Ana layout komponenti
- [ ] Responsive sidebar navigation
- [ ] Header (user info, logout, notifications)
- [ ] Breadcrumb navigation
- [ ] Loading states ve error boundaries

### 4.4 Dashboard
- [ ] Ana dashboard sayfası
- [ ] KPI kartları (satış, stok, müşteri)
- [ ] Grafikler (Chart.js/Recharts)
- [ ] Son aktiviteler listesi

### 4.5 Product Management
- [ ] Ürün listesi sayfası (pagination, search)
- [ ] Ürün ekleme/düzenleme formu
- [ ] Varyant yönetimi interface
- [ ] Toplu işlemler (bulk operations)

## 📦 **Faz 5: Stok ve Sipariş Yönetimi - Sprint 2**

### 5.1 Backend - Order Module
- [ ] Order ve OrderLine entities
- [ ] StockService implementasyonu
- [ ] ROP (Reorder Point) kontrolleri
- [ ] Sipariş CRUD endpoints
- [ ] İskonto hesaplamaları (% ve ₺, tarih aralığı zorunlu)

### 5.2 Backend - Stock Module
- [ ] StockTransaction service
- [ ] Stok IN/OUT işlemleri
- [ ] Stok seviyesi hesaplamaları
- [ ] Low stock alerts (ROP bazlı)
- [ ] Stok hareket raporları

### 5.3 Frontend - Order Management
- [ ] Sipariş listesi sayfası
- [ ] Yeni sipariş oluşturma wizard
- [ ] Sepet fonksiyonalitesi
- [ ] İskonto hesaplama interface
- [ ] Sipariş durumu takibi

### 5.4 Frontend - Stock Management
- [ ] Stok seviyesi görüntüleme
- [ ] Stok hareketleri listesi
- [ ] Low stock alerts interface
- [ ] Stok sayım modülü

## 🧾 **Faz 6: Faturalama ve İade Sistemi - Sprint 2**

### 6.1 Backend - Invoice Module
- [ ] Invoice entity ve service
- [ ] KDV hesaplamaları (%0 ihracat, %20 yurtiçi)
- [ ] Invoice PDF oluşturma (PDFKit/Puppeteer)
- [ ] Fatura numaralama sistemi
- [ ] E-fatura entegrasyonu hazırlığı

### 6.2 Backend - Credit Note System
- [ ] CreditNote ve CreditNoteLine entities
- [ ] ReturnOrder service implementasyonu
- [ ] Kısmi/tam iade logic
- [ ] Stok geri alma (IN transaction)
- [ ] UC-05 senaryosu implementasyonu

### 6.3 Frontend - Invoice & Returns
- [ ] Fatura listesi ve detay sayfaları
- [ ] Fatura oluşturma interface
- [ ] İade başlatma wizard
- [ ] Credit Note görüntüleme
- [ ] PDF preview/download fonksiyonları

## 📊 **Faz 7: Excel Import ve Raporlama - Sprint 2**

### 7.1 Backend - Import Module
- [ ] Excel/CSV parser (multer + xlsx)
- [ ] ImportWizard controller
- [ ] Sütun eşleştirme logic
- [ ] Toplu veri validation
- [ ] Hata raporlama ve errors.csv oluşturma
- [ ] 50,000 satır performans hedefi (≤30s)

### 7.2 Frontend - Import Wizard
- [ ] Dosya upload interface
- [ ] Drag-drop sütun eşleştirme
- [ ] Import progress tracking
- [ ] Hata raporları görüntüleme
- [ ] Template download

### 7.3 Return Reason Management
- [ ] ReturnReason CRUD interface
- [ ] Kullanıcı tanımlı neden yönetimi

## 🤖 **Faz 8: AI Entegrasyonu - Sprint 3**

### 8.1 Backend - AI Module
- [ ] Ollama gateway service
- [ ] Lead scoring algoritması
- [ ] AI endpoint'leri (`/api/ai/*`)
- [ ] Response caching
- [ ] AI model management

### 8.2 Frontend - AI Features
- [ ] Lead scoring dashboard
- [ ] AI önerileri interface
- [ ] Intelligent product recommendations
- [ ] Sales forecasting charts

## 🔒 **Faz 9: Güvenlik ve SSO - Sprint 3**

### 9.1 Security Enhancements
- [ ] HTTPS/TLS 1.3 konfigürasyonu
- [ ] Rate limiting middleware
- [ ] Input validation ve sanitization
- [ ] OWASP security headers
- [ ] XSS ve CSRF protection
- [ ] API key management

### 9.2 Keycloak SSO (Sprint 3)
- [ ] Keycloak container setup
- [ ] SSO entegrasyonu
- [ ] User federation
- [ ] Role mapping

## ⚙️ **Faz 10: DevOps ve Deployment**

### 10.1 CI/CD Pipeline
- [ ] GitHub Actions workflow
- [ ] Jest unit tests setup (≥80% coverage hedefi)
- [ ] SonarQube entegrasyonu
- [ ] Docker image build/push
- [ ] Automated testing pipeline

### 10.2 Backup ve Monitoring
- [ ] Otomatik veritabanı yedekleme (00:00)
- [ ] 7zip AES-256 şifreleme
- [ ] Azure Blob storage upload
- [ ] 30 gün sonra local cleanup
- [ ] Health check endpoints (`/api/health`)
- [ ] Logging sistemi (structured logging)

### 10.3 Performance Monitoring
- [ ] API response time monitoring (<300ms p95)
- [ ] Database performance tuning
- [ ] Resource usage monitoring

## 🧪 **Faz 11: Test ve QA - Sprint 3**

### 11.1 Test Implementasyonu
- [ ] Unit tests (Jest) - %80+ coverage
- [ ] Integration tests (Supertest)
- [ ] E2E tests (Playwright)
- [ ] Load tests (k6) - 50 VU, 1 dk
- [ ] Security tests (OWASP ZAP baseline)

### 11.2 Test Senaryoları
- [ ] Authentication flow tests
- [ ] CRUD operations tests
- [ ] Excel import tests
- [ ] Credit note workflow tests
- [ ] Performance benchmarks

### 11.3 User Acceptance Testing
- [ ] Test senaryoları hazırlama
- [ ] User training dokümanları
- [ ] Bug tracking ve fix
- [ ] Production readiness checklist

## 📈 **Faz 12: Reporting ve Analytics**

### 12.1 Built-in Reports
- [ ] Satış raporları
- [ ] Stok analizleri
- [ ] Müşteri analizleri
- [ ] Finansal raporlar
- [ ] Export fonksiyonları (Excel, PDF)

### 12.2 Power BI Entegrasyonu (Sprint 3)
- [ ] Power BI dashboard'ları
- [ ] Data connector development
- [ ] Real-time data refresh
- [ ] KPI monitoring

## 🚀 **Faz 13: Production Deployment**

### 13.1 Production Environment Setup
- [ ] Ubuntu 22.04 server hazırlığı (4 vCPU / 16 GB RAM)
- [ ] Docker ve Docker Compose kurulumu
- [ ] SSL sertifikası kurulumu
- [ ] Domain ve DNS ayarları
- [ ] Firewall konfigürasyonu

### 13.2 Production Deployment
- [ ] Production docker-compose.yml
- [ ] Environment variables setup
- [ ] Database migration scripts
- [ ] SSL/TLS konfigürasyonu
- [ ] Nginx reverse proxy setup

### 13.3 Go-Live Preparation
- [ ] Data migration plan
- [ ] User training sessions
- [ ] Rollback plan
- [ ] Monitoring ve alerting setup
- [ ] Support documentation

### 13.4 Post-Deployment
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Bug fixes ve optimizations
- [ ] Feature enhancement planning

---

## 📅 **Sprint Takvimi Detayları**

### **Sprint 1 (2 hafta) - Temel Altyapı**
**Hedef:** Docker iskeleti, Auth, Ürün/Varyant, TCMB kur, basit dashboard
- **Hafta 1:** Faz 1-2 (Altyapı + Veritabanı)
- **Hafta 2:** Faz 3-4 (Backend Auth + Frontend Basic)

### **Sprint 2 (3 hafta) - Core Business Logic**
**Hedef:** Stok ROP, Invoice/Credit Note, Excel import
- **Hafta 1:** Faz 5 (Stok ve Sipariş)
- **Hafta 2:** Faz 6 (Faturalama ve İade)
- **Hafta 3:** Faz 7 (Excel Import ve Raporlama)

### **Sprint 3 (2 hafta) - Advanced Features**
**Hedef:** Keycloak SSO, Power BI panoları, E2E testler
- **Hafta 1:** Faz 8-9 (AI + Güvenlik)
- **Hafta 2:** Faz 10-13 (DevOps + Test + Deployment)

---

## 📋 **Kalite Kriterleri**

### **Performance Requirements**
- [ ] API yanıt süresi < 300ms (p95)
- [ ] Excel import 50,000 satır ≤ 30s
- [ ] Dashboard yükleme < 2s
- [ ] %99.9 uptime hedefi

### **Security Requirements**
- [ ] OWASP ASVS 4.0 uyumluluk
- [ ] KVKK teknik tedbirler
- [ ] AES-256 backup encryption
- [ ] JWT token güvenliği

### **Code Quality**
- [ ] Unit test coverage ≥ 80%
- [ ] SonarQube quality gate pass
- [ ] TypeScript strict mode
- [ ] ESLint zero warnings

---

## 🔄 **Risk Yönetimi**

### **Teknik Riskler**
- [ ] MSSQL performans optimizasyonu
- [ ] Large file import memory management
- [ ] Ollama model performansı
- [ ] Network connectivity (TCMB XML)

### **Business Riskler**
- [ ] User adoption
- [ ] Data migration accuracy
- [ ] Training effectiveness
- [ ] Change management

---

**© 2025 Fotek CRM Project**  
**Son Güncelleme:** 2 Haziran 2025  
**Belge Versiyonu:** v1.0  
**Prepared by:** GitHub Copilot
