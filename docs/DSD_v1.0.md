# Fotek CRM v1.0 — Design Specification Document (DSD)

## 1  Yüksek Seviyeli Mimari
```
┌────────────┐ 443  ┌──────────────┐ 3000 ┌────────┐
│ React UI   │────▶│  NestJS API  │─────▶│ MSSQL  │
│ (Vite)     │◀───│  Auth & BLL   │      │ 2022   │
└────────────┘     ├──────────────┤      └────────┘
                   │  Ollama LLM  │ 11434
                   ├──────────────┤
                   │ Jobs+Backup  │
                   └──────────────┘
```
*Reverse‑proxy:* Nginx (TLS 1.3). – *Jobs:* cron → yedek, TCMB kur çekme.

## 2  Veri Tabanı Şeması (özet)
```
Customer(id PK, name, taxNo,…)
Product(id PK, name, isParent,…)
ProductVariant(id PK, productId FK, sku UNIQUE, unitPrice, currency,…)
Order(id PK, customerId FK, orderDate, currency,…)
OrderLine(id PK, orderId FK, productVariantId FK, qty, unitPrice, discountPct,…)
CreditNote(id PK, originalInvoiceId FK, reasonId FK, net, vat, ts)
CreditNoteLine(id PK, creditNoteId FK, productVariantId FK, qty, unitPrice, vatRate)
ReturnReason(id PK, name)                -- Kullanıcı tanımlı
StockTransaction(id PK, productVariantId FK, type IN|OUT, qty, refTable, refId, ts)
AuditLog(id PK, table, recordId, beforeJson, afterJson, actorId, ts)
```

## 3  Modül Görünümü
| Paket | Sınıflar | Görev |
|-------|----------|-------|
| **auth** | `AuthModule`, `JwtStrategy`, `RolesGuard` | Kimlik & Yetki |
| **product** | `ProductService`, `VariantService` | Ürün & Varyant CRUD |
| **order** | `OrderService`, `StockService` | Sipariş akışı, stok OUT |
| **invoice** | `InvoiceService`, `CreditNoteService` | Fatura & negatif fatura |
| **import** | `ImportWizardController`, `ExcelParser` | Excel/CSV aktarım |
| **ai** | `LeadScoreController`, `OllamaGateway` | AI entegrasyonları |

## 4  Akış Diyagramları

### 4.1 Kısmi İade & Credit Note
```
User → UI → POST /returns
      API(ReturnService)
        BEGIN TRAN
        INSERT ReturnOrder, ReturnLines
        INSERT StockTransaction(type=IN, refTable='ReturnLine')
        INSERT CreditNote, CreditNoteLines (negatif)
        INSERT AuditLog
        COMMIT
```

### 4.2 Excel Import (başıksız)
```
User uploads → ImportWizard
  Step 1 ‑ Okuma (stream)
  Step 2 ‑ Başlık eşleştirme (drag‑drop)
  Step 3 ‑ Doğrula → bulk INSERT
  Hatalı satırlar → errors.csv
```

## 5  Audit Interceptor
```ts
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  async intercept(ctx, next) {
    const before = deepClone(entity);
    return next.handle().pipe(
      tap(after => this.repo.save({
        table: entity.constructor.name,
        recordId: entity.id,
        beforeJson: before,
        afterJson: after,
        actorId: ctx.user.id,
        ts: new Date()
      }))
    );
  }
}
```

## 6  Yedekleme Akışı
1. **00:00** `BACKUP DATABASE crm ...`  
2. `7z a -p$KEY enc_YYYYMMDD.7z crm_*.bak`  
3. `azcopy copy enc_*.7z https://blob/...`  
4. `find /backup -type f -mtime +30 -delete`

## 7  CI/CD Boru Hattı
1. GitHub PR: jest ≥ 80 %, sonar → pass.  
2. master merge → Docker build & push.  
3. Azure DevOps Release → `docker compose pull && up -d`.  
4. Health‑check `/api/health` aksarsa rollback.

## 8  Test Planı Özet
| Seviye | Örnek Senaryo | Araç |
|--------|---------------|------|
| Unit | `CreditNoteService` KDV hesabı | Jest |
| Integration | `/returns` endpoint + stok IN | Supertest |
| UI | Excel eşleştirme drag‑drop | Playwright |
| Load | 50 VU, 1 dk | k6 |
| Security | OWASP ZAP baseline | ZAP |

---

© 2025 Fotek CRM Project – DSD v1.0
