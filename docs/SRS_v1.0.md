# Fotek CRM v1.0 — Software Requirements Specification (SRS)

## 1  Giriş  
| Başlık | İçerik |
|--------|--------|
| **Amaç** | Fotek TR distribütörlüğünün ihracat (%0 KDV) ve yurt‑içi (%20 KDV) satış, fatura, stok ve dövizli iskonto işlemlerini tek portala taşıyan, AI destekli, web tabanlı CRM geliştirmek. |
| **Kapsam** | Tek VM (Ubuntu 22.04) üzerinde Docker‑Compose (Nginx, React UI, NestJS API, MSSQL 2022, Ollama). |
| **Tanımlar** | **Credit Note:** Negatif tutarlı fatura.<br>**Variant:** Renk‑Beden SKU.<br>**ROP:** Reorder Point.<br>**TCMB XML:** Günlük kur dosyası. |
| **Referanslar** | IEEE 830‑1998, IEEE 1016‑2017, OWASP ASVS 4.0, KVKK Teknik Tedbirler, TCMB `today.xml` şeması. |

## 2  Genel Tanım
* **Ürün Perspektifi :** Monolitik NestJS + React, gelecekte mikro‑servislere ayrılabilir.  
* **Kullanıcı Rolleri :** Satış (3), Muhasebe (2), Yönetici (1).  
* **Kısıtlar :** 4 vCPU / 16 GB RAM, tek depo, internet: TCMB XML + SMTP.  
* **Bağımlılıklar :** TCMB XML akışı çevrimdışıysa kur yenilemesi yapılmaz (loglanır).

## 3  Gereksinimler  

### 3.1 Fonksiyonel Gereksinimler
| ID | Gereksinim | Açıklama |
|----|------------|----------|
| FR‑001 | JWT tabanlı oturum & rol kontrolü | Token süresi 8 saat, refresh |
| FR‑003 | Ürün & Varyant CRUD | Üç seviyeye kadar varyant (renk, beden, kapasite) |
| FR‑004 | Satır & sepet bazlı % / ₺ iskonto | Tarih aralığı zorunlu |
| FR‑006 | TCMB `today.xml` ile kur yenileme | 00:05 Europe/Istanbul |
| FR‑012 | Ürün satırında KDV %0 veya %20 seçimi | İhracat = %0 |
| FR‑013 | Kısmi / tam iade, **Credit Note** & stok IN | Negatif fatura |
| FR‑014 | CRUD işlemleri sınırsız saklanan **AuditLog**’a kaydedilir | KVKK silme talebi hariç |
| FR‑015 | Excel/CSV toplu aktarım sihirbazı | Başlık eşleştirme ekranı |
| FR‑016 | İade nedenleri kullanıcı tanımlı | CRUD arayüzü |

*(Toplam 26 FR maddesi belgenin EK‑A’sında ayrıntılıdır.)*

### 3.2 Fonksiyonel Olmayan Gereksinimler
| Kod | Gereksinim | Hedef |
|-----|------------|-------|
| NFR‑PERF‑01 | Ortalama API yanıtı | < 300 ms (p95) |
| NFR‑INT‑02 | 50 000 satırlık Excel aktarımı | ≤ 30 s |
| NFR‑AUD‑01 | AuditLog saklama süresi | **Sınırsız** |
| NFR‑SEC‑03 | Yedek dosyaları | AES‑256 + parola |

### 3.3 Kullanım Senaryosu Örneği — UC‑05 “Kısmi İade & Credit Note”
1. Muhasebe “İade Başlat” → orijinal fatura seçer.  
2. Satırlar listelenir, miktar seçilir, iade nedeni (kullanıcı tanımlı) seçilir.  
3. Sistem: stok IN, `ReturnOrder`, `ReturnLine`, **Credit Note** oluşturur, AuditLog kaydeder.  
4. Kullanıcı onaylar → PDF çıktısı.

## 4  Takvim ve Sürüm Yönetimi
* **Sprint‑1** (2 hafta): Docker iskeleti, Auth, Ürün/Varyant, TCMB kur, basit dashboard.  
* **Sprint‑2** (3 hafta): Stok ROP, Invoice/Credit Note, Excel import.  
* **Sprint‑3** (2 hafta): Keycloak SSO, Power BI panoları, E2E testler.

---

© 2025 Fotek CRM Project – SRS v1.0
