# 🏢 Fotek CRM v1.0

**AI destekli, web tabanlı CRM sistemi** - Fotek TR distribütörlüğü için geliştirilmiştir.

## 📋 Proje Özeti

Fotek CRM, ihracat (%0 KDV) ve yurt içi (%20 KDV) satış, fatura, stok ve dövizli iskonto işlemlerini tek portala taşıyan modern bir CRM sistemidir.

## 🏗️ Teknoloji Stack

- **Frontend:** React 18 + Vite + TypeScript + Ant Design
- **Backend:** NestJS + TypeORM + JWT Auth
- **Veritabanı:** Microsoft SQL Server 2022
- **AI:** Ollama LLM (Lead Scoring)
- **DevOps:** Docker + Docker Compose + Nginx
- **Deployment:** Ubuntu 22.04 (4 vCPU / 16 GB RAM)

## 📁 Proje Yapısı

```
FotekCRM/
├── backend/          # NestJS API
├── frontend/         # React + Vite
├── database/         # MSSQL scripts
├── docker/           # Docker configs
├── docs/            # Belgeler (SRS, DSD)
├── scripts/         # Deployment scripts
└── tests/           # Test dosyaları
```

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- Docker & Docker Compose
- Git

### Kurulum

```bash
# Repository'yi klonlayın
git clone <repo-url>
cd FotekCRM

# Tüm bağımlılıkları yükleyin
npm run install:all

# Docker servisleri başlatın
npm run docker:up

# Geliştirme modunda çalıştırın
npm run dev
```

### Kullanılabilir Komutlar

```bash
npm run dev              # Frontend + Backend geliştirme modu
npm run build            # Production build
npm run test             # Tüm testleri çalıştır
npm run lint             # Code linting
npm run format           # Code formatting
npm run docker:up        # Docker servisleri başlat
npm run docker:down      # Docker servisleri durdur
```

## 📚 Dokümantasyon

- [Software Requirements Specification (SRS)](./docs/SRS_v1.0.md)
- [Design Specification Document (DSD)](./docs/DSD_v1.0.md)
- [Yapılacaklar Listesi](./docs/YAPILACAKLAR.md)

## 🏃‍♂️ Sprint Planı

- **Sprint 1** (2 hafta): Docker iskeleti, Auth, Ürün/Varyant, TCMB kur
- **Sprint 2** (3 hafta): Stok ROP, Invoice/Credit Note, Excel import
- **Sprint 3** (2 hafta): Keycloak SSO, Power BI, E2E testler

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama (8 saat token)
- Role-based access control (Satış, Muhasebe, Yönetici)
- OWASP ASVS 4.0 uyumluluk
- KVKK teknik tedbirler

## 📊 Özellikler

- ✅ Ürün & Varyant Yönetimi (3 seviye: renk, beden, kapasite)
- ✅ Sipariş & Stok Yönetimi (ROP alerts)
- ✅ Faturalama (%0/%20 KDV, dövizli işlemler)
- ✅ Kısmi/Tam İade & Credit Note
- ✅ Excel/CSV Toplu İçe Aktarım
- ✅ TCMB Kur Entegrasyonu
- ✅ AI Lead Scoring
- ✅ Audit Log (KVKK uyumlu)

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📝 Lisans

Bu proje özel lisans altındadır. Detaylar için iletişime geçin.

## 📞 İletişim

**Fotek CRM Geliştirme Ekibi**

---

*Son Güncelleme: 2 Haziran 2025*