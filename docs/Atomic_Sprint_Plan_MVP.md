# Fotek CRM – MVP Atomic Sprint Plan (Solo Developer)

> Her sprint = 1 iş günü · Tek geliştirici · Tek PR · Akşam merge & mini demo  
> Odak süresi ≈ 6 saat/gün (kalan zaman: test, dokümantasyon, bakım)

| Sprint | Günlük Hedef | Görevlar | “Done” Kriteri |
|-------|--------------|----------|----------------|
| **S‑0** | **Docker‑Compose iskeleti + README** | • `db`, `api`, `frontend` servisleri<br>• Nest “/health`, Vite “Hello CRM” | `docker compose up` → UI & `/health` 200 |
| **S‑1** | **CI Pipeline** | • GitHub Actions: install → jest dummy → docker build → push | PR açılınca workflow yeşil, imaj Hub’da |
| **S‑2** | **User Entity + JWT Login (API)** | • `User` modeli, bcrypt hash, `/auth/login` | Doğru şifre 200 + JWT, yanlış 401 |
| **S‑3** | **Login UI & Token Saklama** | • Ant Design form, token localStorage | Başarılı login → “Dashboard” sayfası |
| **S‑4** | **Rol Sistemi (admin/user)** | • Seed script, `RolesGuard`, menü gizleme | `/admin/users` yalnız admin’e 200 |
| **S‑5** | **Müşteri CRUD (API)** | • `Customer` controller + jest | `/customers` POST/GET çalışıyor |
| **S‑6** | **Müşteri UI** | • Formik + Ant Table + validasyon | Müşteri ekle, listede gör |
| **S‑7** | **Ürün Temeli (API)** | • `Product` entity (isim, kod, KDV) | `/products` POST/GET → 201/200 |
| **S‑8** | **Ürün Formu (UI)** | • Ant Form + tablo, silme butonu | Ürün ekle‑sil → tablo güncellenir |
| **S‑9** | **Varyant Model & API** | • `ProductVariant`, `VariantAttr` | `/variants` POST/GET, SKU unique |
| **S‑10** | **Varyant UI** | • Renk/beden grid, inline edit | Yeni varyant ekle, tablo yenilenir |
| **S‑11** | **Sipariş & Stok OUT (API)** | • `Order`, `OrderLine`, `StockTransaction` | `/orders` POST → stok düşer |
| **S‑12** | **Sipariş Formu (UI)** | • Müşteri seç, ürün ekle, satır % iskonto | “Kaydet” toast “Sipariş #id” |
| **S‑13** | **TCMB Kur Cron + Döviz** | • XML fetch @00:05, `ExchangeRate` tablo | USD/EUR kayıt oluşur, formda listelenir |
| **S‑14** | **Fatura %0 / %20 (API)** | • `Invoice`, `InvoiceLine`, KDV hesabı | `/invoices` POST JSON + mock PDF |
| **S‑15** | **Fatura PDF (UI)** | • PDF endpoint → iframe preview | PDF açılır, KDV doğru |
| **S‑16** | **Aylık Satış Grafiği** | • SQL VIEW, `/reports/sales` endpoint, Chart.js | Grafikte ay & tutar |
| **S‑17** | **Günlük Şifreli Yedek** | • Cron container (`sqlcmd` + `7z`) | `/backup/enc_YYYYMMDD.7z` oluşur |
| **S‑18** | **Smoke E2E & v0.1.0 Tag** | • Playwright “login→order→invoice” | Test yeşil, tag push → prod deploy |

---

## Günlük Ritim (öneri)

| Saat | Aktivite |
|------|----------|
| **09:00 – 09:15** | Sprint hedefini netleştir, engel notu |
| **09:15 – 15:30** | Kod + test + doküman (Pomodoro/90 dk bloklar) |
| **15:30 – 16:30** | Self‑review, jest & linter, PR hazırlığı |
| **16:30 – 17:00** | Lokal demo, PR merge, `main` build’in yeşil olduğunu doğrula |

---

_Versiyon 1.0 · 5 Haz 2025_
