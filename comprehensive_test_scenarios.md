# 🧪 Fotek CRM - Kapsamlı Test Senaryoları ve Test Planı

## 📊 Proje Analizi ve Test Kapsamı

### 🏗️ Sistem Mimarisi
```
┌─────────────────────────────────────────────────────────────┐
│                    FotekCRM System                         │
├─────────────────────────────────────────────────────────────┤
│ Frontend (React + Vite + Ant Design)                       │
│ ├── Authentication (Login/Register)                        │
│ ├── Dashboard & Analytics                                  │
│ ├── Company Management                                     │
│ ├── Contact Management                                     │
│ ├── Product Management                                     │
│ ├── Order Management                                       │
│ ├── Invoice Management                                     │
│ └── Admin Panel                                           │
├─────────────────────────────────────────────────────────────┤
│ Backend (NestJS + TypeORM + MSSQL)                        │
│ ├── Auth Module (JWT)                                     │
│ ├── Companies Module                                      │
│ ├── Contacts Module                                       │
│ ├── Products Module                                       │
│ ├── Variants Module                                       │
│ ├── Orders Module                                         │
│ ├── Invoices Module                                       │
│ ├── Exchange Rates Module                                 │
│ ├── Analytics Module                                      │
│ └── Admin Module                                          │
├─────────────────────────────────────────────────────────────┤
│ Infrastructure                                             │
│ ├── MSSQL Database                                        │
│ ├── Nginx Reverse Proxy                                   │
│ ├── Docker Containers                                     │
│ └── Backup Service                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 1. AUTHENTICATION & SECURITY TEST SENARYOLARI

### 1.1 Backend Authentication API Tests

#### Test 1.1.1: Kullanıcı Kaydı (User Registration)
```typescript
describe('User Registration', () => {
  test('Başarılı kullanıcı kaydı', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'testuser@fotek.com',
        firstName: 'Test',
        lastName: 'Kullanıcı',
        password: 'GüçlüŞifre123!'
      })
      .expect(201);
    
    expect(response.body).toHaveProperty('access_token');
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user.email).toBe('testuser@fotek.com');
  });

  test('Zayıf şifre ile kayıt', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'test2@fotek.com',
        firstName: 'Test',
        lastName: 'User',
        password: '123'
      })
      .expect(400);
  });

  test('Duplicate email kontrolü', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'testuser@fotek.com',
        firstName: 'Başka',
        lastName: 'Kullanıcı',
        password: 'GüçlüŞifre123!'
      })
      .expect(409);
  });
});
```

#### Test 1.1.2: Kullanıcı Girişi (User Login)
```typescript
describe('User Login', () => {
  test('Geçerli kredentiyaller ile giriş', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'testuser@fotek.com',
        password: 'GüçlüŞifre123!'
      })
      .expect(200);
    
    expect(response.body).toHaveProperty('access_token');
    expect(response.body.user.email).toBe('testuser@fotek.com');
  });

  test('Yanlış şifre ile giriş', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'testuser@fotek.com',
        password: 'YanlışŞifre'
      })
      .expect(401);
  });

  test('Olmayan email ile giriş', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'olmayan@fotek.com',
        password: 'HerhangiBirŞifre'
      })
      .expect(401);
  });
});
```

### 1.2 Frontend Authentication Tests

#### Test 1.2.1: Login UI Flow
```typescript
describe('Login UI Tests', () => {
  test('Login formu görünürlüğü', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test('Başarılı giriş sonrası yönlendirme', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'testuser@fotek.com');
    await page.fill('[data-testid="password-input"]', 'GüçlüŞifre123!');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Hoş geldiniz')).toBeVisible();
  });

  test('Yanlış kredentiyaller ile hata mesajı', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'test@fotek.com');
    await page.fill('[data-testid="password-input"]', 'yanlış');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('text=Geçersiz email veya şifre')).toBeVisible();
  });
});
```

#### Test 1.2.2: Protected Routes
```typescript
describe('Protected Routes Tests', () => {
  test('Auth olmadan dashboard erişimi', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('Token süresi dolması', async ({ page }) => {
    await page.goto('/login');
    
    // Login ol
    await page.fill('[data-testid="email-input"]', 'testuser@fotek.com');
    await page.fill('[data-testid="password-input"]', 'GüçlüŞifre123!');
    await page.click('[data-testid="login-button"]');
    
    // Token'ı localStorage'dan sil
    await page.evaluate(() => localStorage.removeItem('fotek_auth_token'));
    
    // Herhangi bir korumalı sayfaya git
    await page.goto('/dashboard');
    
    await expect(page).toHaveURL('/login');
  });
});
```

---

## 🏢 2. COMPANY MANAGEMENT TEST SENARYOLARI

### 2.1 Backend Company API Tests

#### Test 2.1.1: Firma CRUD İşlemleri
```typescript
describe('Company CRUD Operations', () => {
  let authToken: string;
  let companyId: string;

  beforeEach(async () => {
    // Auth token al
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'testuser@fotek.com',
        password: 'GüçlüŞifre123!'
      });
    authToken = loginResponse.body.access_token;
  });

  test('Yeni firma oluşturma', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/companies')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Teknoloji A.Ş.',
        email: 'info@testteknoloji.com',
        phone: '+90 212 555 0123',
        industry: 'Technology',
        website: 'https://testteknoloji.com',
        address: 'Maslak Mahallesi, İnovitas Caddesi No:42',
        city: 'İstanbul',
        country: 'Türkiye',
        status: 'lead',
        taxNumber: '1234567890'
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test Teknoloji A.Ş.');
    companyId = response.body.id;
  });

  test('Firma listesi çekme (pagination)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/companies?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('companies');
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pagination).toHaveProperty('page');
    expect(response.body.pagination).toHaveProperty('limit');
    expect(response.body.pagination).toHaveProperty('total');
  });

  test('Firma arama', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/companies?search=Test')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.companies.length).toBeGreaterThan(0);
    expect(response.body.companies[0].name).toContain('Test');
  });

  test('Firma güncelleme', async () => {
    const response = await request(app.getHttpServer())
      .put(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Güncellenmiş Test Teknoloji A.Ş.',
        status: 'customer'
      })
      .expect(200);

    expect(response.body.name).toBe('Güncellenmiş Test Teknoloji A.Ş.');
    expect(response.body.status).toBe('customer');
  });

  test('Firma silme', async () => {
    await request(app.getHttpServer())
      .delete(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Silindiğini kontrol et
    await request(app.getHttpServer())
      .get(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
});
```

#### Test 2.1.2: Company Statistics
```typescript
describe('Company Statistics', () => {
  test('Firma istatistikleri', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/companies/stats')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('leads');
    expect(response.body).toHaveProperty('prospects');
    expect(response.body).toHaveProperty('customers');
    expect(response.body).toHaveProperty('inactive');
    expect(typeof response.body.total).toBe('number');
  });
});
```

### 2.2 Frontend Company Management Tests

#### Test 2.2.1: Company List Page
```typescript
describe('Company List Page', () => {
  test('Firma listesi görüntüleme', async ({ page }) => {
    await loginAndNavigate(page, '/dashboard');
    
    await page.click('text=Firmalar');
    await expect(page).toHaveURL('/companies');
    
    await expect(page.locator('[data-testid="company-list-table"]')).toBeVisible();
    await expect(page.locator('text=Yeni Firma')).toBeVisible();
  });

  test('Firma arama fonksiyonu', async ({ page }) => {
    await loginAndNavigate(page, '/companies');
    
    await page.fill('[data-testid="search-input"]', 'Test');
    await page.click('[data-testid="search-button"]');
    
    await page.waitForTimeout(1000); // API çağrısını bekle
    await expect(page.locator('table tbody tr')).toHaveCount(1); // En az 1 sonuç
  });

  test('Sayfalama (pagination)', async ({ page }) => {
    await loginAndNavigate(page, '/companies');
    
    // İkinci sayfaya git
    await page.click('[data-testid="pagination"] >> text=2');
    await expect(page.locator('[data-testid="pagination"] .ant-pagination-item-active')).toContainText('2');
  });
});
```

#### Test 2.2.2: Company Form Tests
```typescript
describe('Company Form Tests', () => {
  test('Yeni firma ekleme', async ({ page }) => {
    await loginAndNavigate(page, '/companies');
    
    await page.click('text=Yeni Firma');
    await expect(page).toHaveURL('/companies/new');
    
    // Formu doldur
    await page.fill('[data-testid="company-name"]', 'Yeni Test Firması');
    await page.fill('[data-testid="company-email"]', 'info@yenitestfirmasi.com');
    await page.fill('[data-testid="company-phone"]', '+90 212 555 9999');
    await page.selectOption('[data-testid="company-status"]', 'lead');
    
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=Firma başarıyla oluşturuldu')).toBeVisible();
    await expect(page).toHaveURL('/companies');
  });

  test('Form validasyon kontrolleri', async ({ page }) => {
    await loginAndNavigate(page, '/companies/new');
    
    // Boş form gönder
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('text=Firma adı gereklidir')).toBeVisible();
    await expect(page.locator('text=Email gereklidir')).toBeVisible();
  });
});
```

---

## 👥 3. CONTACT MANAGEMENT TEST SENARYOLARI

### 3.1 Backend Contact API Tests

#### Test 3.1.1: Contact CRUD Operations
```typescript
describe('Contact CRUD Operations', () => {
  test('Yeni kişi oluşturma', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/contacts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        email: 'ahmet.yilmaz@testfirma.com',
        phone: '+90 532 555 1234',
        position: 'Satış Müdürü',
        companyId: companyId,
        isActive: true
      })
      .expect(201);

    expect(response.body.firstName).toBe('Ahmet');
    expect(response.body.lastName).toBe('Yılmaz');
    expect(response.body.fullName).toBe('Ahmet Yılmaz');
  });

  test('Firma ile ilişkili kişileri getirme', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/contacts?companyId=${companyId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.contacts.length).toBeGreaterThan(0);
    expect(response.body.contacts[0].companyId).toBe(companyId);
  });
});
```

### 3.2 Frontend Contact Tests

#### Test 3.2.1: Contact List and Form
```typescript
describe('Contact Management UI', () => {
  test('Kişi listesi ve ekleme', async ({ page }) => {
    await loginAndNavigate(page, '/contacts');
    
    await page.click('text=Yeni Kişi');
    
    await page.fill('[data-testid="first-name"]', 'Mehmet');
    await page.fill('[data-testid="last-name"]', 'Demir');
    await page.fill('[data-testid="email"]', 'mehmet.demir@test.com');
    await page.fill('[data-testid="phone"]', '+90 533 555 7777');
    
    await page.click('[data-testid="save-contact"]');
    
    await expect(page.locator('text=Kişi başarıyla oluşturuldu')).toBeVisible();
  });
});
```

---

## 📦 4. PRODUCT MANAGEMENT TEST SENARYOLARI

### 4.1 Backend Product API Tests

#### Test 4.1.1: Product CRUD Operations
```typescript
describe('Product Management', () => {
  test('Yeni ürün oluşturma', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Ürünü',
        sku: 'TEST-001',
        description: 'Bu bir test ürünüdür',
        unitPrice: 100.50,
        currency: 'TRY',
        stockQuantity: 50,
        minStockLevel: 10,
        category: 'Electronics',
        isActive: true
      })
      .expect(201);

    expect(response.body.name).toBe('Test Ürünü');
    expect(response.body.sku).toBe('TEST-001');
    expect(response.body.unitPrice).toBe(100.50);
  });

  test('SKU unique kontrolü', async () => {
    await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Başka Ürün',
        sku: 'TEST-001', // Aynı SKU
        unitPrice: 200
      })
      .expect(409);
  });

  test('Stok seviyesi uyarısı', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/products/low-stock')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

### 4.2 Product Variants Tests

#### Test 4.2.1: Variant Management
```typescript
describe('Product Variants', () => {
  test('Ürün varyantı oluşturma', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/variants')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        productId: productId,
        name: 'Kırmızı - Medium',
        sku: 'TEST-001-RED-M',
        attributes: [
          { name: 'Renk', value: 'Kırmızı' },
          { name: 'Beden', value: 'Medium' }
        ],
        additionalPrice: 15.00,
        stockQuantity: 25
      })
      .expect(201);

    expect(response.body.name).toBe('Kırmızı - Medium');
    expect(response.body.attributes.length).toBe(2);
  });
});
```

---

## 📋 5. ORDER MANAGEMENT TEST SENARYOLARI

### 5.1 Backend Order Tests

#### Test 5.1.1: Order Creation and Processing
```typescript
describe('Order Management', () => {
  test('Yeni sipariş oluşturma', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        companyId: companyId,
        contactId: contactId,
        orderDate: new Date().toISOString(),
        status: 'pending',
        currency: 'TRY',
        orderLines: [
          {
            productId: productId,
            variantId: variantId,
            quantity: 5,
            unitPrice: 100.50,
            discount: 10.00
          }
        ]
      })
      .expect(201);

    expect(response.body.status).toBe('pending');
    expect(response.body.orderLines.length).toBe(1);
    expect(response.body.totalAmount).toBe(452.25); // (100.50 * 5) - 10 + KDV
  });

  test('Sipariş durumu güncelleme', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'confirmed' })
      .expect(200);

    expect(response.body.status).toBe('confirmed');
  });
});
```

---

## 💰 6. INVOICE MANAGEMENT TEST SENARYOLARI

### 6.1 Invoice Generation Tests

#### Test 6.1.1: Invoice Creation from Order
```typescript
describe('Invoice Management', () => {
  test('Siparişten fatura oluşturma', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/invoices/from-order')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        orderId: orderId,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 gün sonra
      })
      .expect(201);

    expect(response.body).toHaveProperty('invoiceNumber');
    expect(response.body.totalAmount).toBeGreaterThan(0);
    expect(response.body.status).toBe('draft');
  });
});
```

---

## 📊 7. ANALYTICS & REPORTING TEST SENARYOLARI

### 7.1 Dashboard Analytics Tests

#### Test 7.1.1: Dashboard Data
```typescript
describe('Analytics and Dashboard', () => {
  test('Dashboard istatistikleri', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('totalCompanies');
    expect(response.body).toHaveProperty('totalOrders');
    expect(response.body).toHaveProperty('totalRevenue');
    expect(response.body).toHaveProperty('monthlyStats');
  });

  test('Aylık satış verileri', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/analytics/monthly-sales')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('month');
      expect(response.body[0]).toHaveProperty('revenue');
    }
  });
});
```

---

## 🔧 8. INFRASTRUCTURE & PERFORMANCE TEST SENARYOLARI

### 8.1 Docker Container Health Tests

#### Test 8.1.1: Container Status Verification
```bash
#!/bin/bash
# Test Script: docker-health-check.sh

echo "🐳 Docker Container Sağlık Kontrolü"
echo "=================================="

# Container'ları kontrol et
containers=("fotek_db" "fotek_api" "fotek_frontend" "fotek_nginx" "fotek_backup")

for container in "${containers[@]}"; do
    status=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null)
    if [ "$status" = "healthy" ]; then
        echo "✅ $container: Sağlıklı"
    else
        echo "❌ $container: Sorunlu ($status)"
        exit 1
    fi
done

echo "🎉 Tüm container'lar sağlıklı!"
```

### 8.2 Database Performance Tests

#### Test 8.2.1: Database Connection and Query Performance
```typescript
describe('Database Performance', () => {
  test('Veritabanı bağlantı süresi', async () => {
    const startTime = Date.now();
    await dataSource.initialize();
    const connectionTime = Date.now() - startTime;
    
    expect(connectionTime).toBeLessThan(5000); // 5 saniyeden az olmalı
  });

  test('Büyük veri seti sorgu performansı', async () => {
    const startTime = Date.now();
    const companies = await companyRepository.find({
      take: 1000,
      relations: ['contacts', 'orders']
    });
    const queryTime = Date.now() - startTime;
    
    expect(queryTime).toBeLessThan(2000); // 2 saniyeden az olmalı
    expect(companies.length).toBeLessThanOrEqual(1000);
  });
});
```

### 8.3 API Performance Tests

#### Test 8.3.1: Load Testing Scenarios
```typescript
describe('API Load Testing', () => {
  test('Eşzamanlı kullanıcı yük testi', async () => {
    const concurrentUsers = 10;
    const promises = [];

    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(
        request(app.getHttpServer())
          .get('/api/companies')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
      );
    }

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    expect(results.length).toBe(concurrentUsers);
    expect(totalTime).toBeLessThan(5000); // 5 saniyeden az
  });
});
```

---

## 🛡️ 9. SECURITY TEST SENARYOLARI

### 9.1 Authentication Security Tests

#### Test 9.1.1: JWT Token Security
```typescript
describe('Security Tests', () => {
  test('Geçersiz JWT token ile erişim', async () => {
    await request(app.getHttpServer())
      .get('/api/companies')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  test('Süresi dolmuş token ile erişim', async () => {
    const expiredToken = jwt.sign(
      { userId: 1, email: 'test@fotek.com' },
      'secret',
      { expiresIn: '-1h' }
    );

    await request(app.getHttpServer())
      .get('/api/companies')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  test('SQL Injection önleme', async () => {
    await request(app.getHttpServer())
      .get('/api/companies?search=\'; DROP TABLE companies; --')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200); // Başarılı olmalı, hiçbir şey silmemeli
  });
});
```

### 9.2 Data Validation Tests

#### Test 9.2.1: Input Validation
```typescript
describe('Input Validation', () => {
  test('XSS önleme', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/companies')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: '<script>alert("XSS")</script>',
        email: 'test@fotek.com'
      })
      .expect(400); // Validation hatası vermeli
  });

  test('Email formatı kontrolü', async () => {
    await request(app.getHttpServer())
      .post('/api/companies')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Firma',
        email: 'geçersiz-email'
      })
      .expect(400);
  });
});
```

---

## 📱 10. UI/UX & ACCESSIBILITY TEST SENARYOLARI

### 10.1 Frontend UI Tests

#### Test 10.1.1: Responsive Design Tests
```typescript
describe('Responsive Design', () => {
  test('Mobil görünüm testi', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAndNavigate(page, '/dashboard');
    
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();
  });

  test('Tablet görünüm testi', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await loginAndNavigate(page, '/companies');
    
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('[data-testid="action-buttons"]')).toBeVisible();
  });
});
```

### 10.2 Accessibility Tests

#### Test 10.2.1: WCAG Compliance
```typescript
describe('Accessibility Tests', () => {
  test('Klavye navigasyonu', async ({ page }) => {
    await loginAndNavigate(page, '/companies');
    
    // Tab ile navigasyon
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('[data-testid="company-form"]')).toBeVisible();
  });

  test('Screen reader uyumluluğu', async ({ page }) => {
    await loginAndNavigate(page, '/companies');
    
    const table = await page.locator('table');
    const ariaLabel = await table.getAttribute('aria-label');
    expect(ariaLabel).toContain('Firma listesi');
  });
});
```

---

## 🔄 11. INTEGRATION TEST SENARYOLARI

### 11.1 End-to-End Business Flow Tests

#### Test 11.1.1: Complete Customer Journey
```typescript
describe('Complete Business Flow', () => {
  test('Müşteri yaşam döngüsü testi', async ({ page }) => {
    await loginAndNavigate(page, '/dashboard');

    // 1. Yeni firma ekle
    await page.click('text=Firmalar');
    await page.click('text=Yeni Firma');
    await page.fill('[data-testid="company-name"]', 'Entegrasyon Test Firması');
    await page.fill('[data-testid="company-email"]', 'info@entegrasyontest.com');
    await page.click('[data-testid="save-button"]');
    
    // 2. Firmaya kişi ekle
    await page.click('text=Kişiler');
    await page.click('text=Yeni Kişi');
    await page.fill('[data-testid="first-name"]', 'Test');
    await page.fill('[data-testid="last-name"]', 'Kişi');
    await page.selectOption('[data-testid="company-select"]', 'Entegrasyon Test Firması');
    await page.click('[data-testid="save-contact"]');
    
    // 3. Ürün ekle
    await page.click('text=Ürünler');
    await page.click('text=Yeni Ürün');
    await page.fill('[data-testid="product-name"]', 'Test Ürünü');
    await page.fill('[data-testid="product-sku"]', 'TEST-ENTEGRASYON-001');
    await page.fill('[data-testid="unit-price"]', '150');
    await page.click('[data-testid="save-product"]');
    
    // 4. Sipariş oluştur
    await page.click('text=Siparişler');
    await page.click('text=Yeni Sipariş');
    await page.selectOption('[data-testid="order-company"]', 'Entegrasyon Test Firması');
    await page.selectOption('[data-testid="order-contact"]', 'Test Kişi');
    await page.click('[data-testid="add-product"]');
    await page.selectOption('[data-testid="product-select"]', 'Test Ürünü');
    await page.fill('[data-testid="quantity"]', '2');
    await page.click('[data-testid="save-order"]');
    
    // 5. Siparişi onayla
    await page.click('[data-testid="confirm-order"]');
    await expect(page.locator('text=Sipariş onaylandı')).toBeVisible();
    
    // 6. Fatura oluştur
    await page.click('[data-testid="create-invoice"]');
    await page.click('[data-testid="save-invoice"]');
    await expect(page.locator('text=Fatura oluşturuldu')).toBeVisible();
  });
});
```

---

## 📋 12. TEST EXECUTION PLAN & AUTOMATION

### 12.1 Test Koşma Stratejisi

#### Test Seviyeleri:
1. **Unit Tests** (Backend Services)
   - Jest ile backend service testleri
   - Çalıştırma: `npm run test`
   - Target: %80+ kod kapsamı

2. **Integration Tests** (API + Database)
   - Supertest ile API endpoint testleri
   - Çalıştırma: `npm run test:integration`

3. **E2E Tests** (Full User Journey)
   - Playwright ile browser testleri
   - Çalıştırma: `npm run test:e2e`

4. **Performance Tests** (Load & Stress)
   - K6 ile yük testleri
   - Çalıştırma: `npm run test:performance`

### 12.2 CI/CD Pipeline Integration

```yaml
# .github/workflows/test-pipeline.yml
name: Fotek CRM Test Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      mssql:
        image: mcr.microsoft.com/mssql/server:2022-latest
        env:
          ACCEPT_EULA: Y
          SA_PASSWORD: TestPassword123!
    steps:
      - uses: actions/checkout@v3
      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Start services
        run: docker compose up -d
      - name: Wait for services
        run: sleep 60
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📊 13. TEST REPORTING & METRICS

### 13.1 Test Metrikleri

#### Başarı Kriterleri:
- **Unit Test Coverage**: Minimum %80
- **Integration Test Pass Rate**: %95+
- **E2E Test Pass Rate**: %90+
- **Performance Benchmarks**:
  - API Response Time: <200ms (95th percentile)
  - Page Load Time: <3 seconds
  - Database Query Time: <100ms

#### Test Raporlama:
```typescript
// Test sonuçları için özel reporter
class FotekTestReporter {
  onTestResult(test, testResult) {
    const metrics = {
      testName: test.path,
      duration: testResult.perfStats.end - testResult.perfStats.start,
      status: testResult.numFailingTests === 0 ? 'PASS' : 'FAIL',
      coverage: testResult.coverage
    };
    
    // Metrics'i database'e kaydet
    this.saveMetrics(metrics);
  }
}
```

---

## 🎯 14. TEST EXECUTION COMMANDS

### 14.1 Hızlı Test Komutları

```bash
# Tüm testleri çalıştır
npm run test:all

# Sadece unit testler
npm run test

# Integration testler
npm run test:integration

# E2E testler (headless)
npm run test:e2e

# E2E testler (browser ile)
npm run test:e2e:headed

# Performance testler
npm run test:performance

# Belirli modül testi
npm run test -- --testPathPattern=companies

# Watch mode (development)
npm run test:watch

# Coverage raporu
npm run test:coverage
```

### 14.2 Docker ile Test Ortamı

```bash
# Test ortamını başlat
docker compose -f docker-compose.test.yml up -d

# Testleri çalıştır
docker compose exec test-runner npm run test:all

# Test ortamını temizle
docker compose -f docker-compose.test.yml down -v
```

---

## 🔍 15. DEBUGGING & TROUBLESHOOTING

### 15.1 Test Debug Komutları

```bash
# Playwright debug mode
npm run test:e2e:debug

# Jest debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Docker container logları
docker compose logs fotek_api
docker compose logs fotek_db

# Test sonuçlarını görüntüle
npm run test:e2e:report
```

### 15.2 Yaygın Test Sorunları ve Çözümleri

#### Problem: Database connection timeout
```typescript
// Çözüm: Connection timeout artır
beforeAll(async () => {
  await dataSource.initialize();
}, 30000); // 30 saniye timeout
```

#### Problem: Race conditions in tests
```typescript
// Çözüm: Proper async/await kullan
test('Async test', async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

---

Bu kapsamlı test senaryoları FotekCRM projesinin her bileşenini test edecek ve kaliteli bir yazılım ürünü sunulmasını sağlayacaktır. Test senaryoları geliştirme sürecinde sürekli güncellenmeli ve yeni özellikler eklendikçe genişletilmelidir.