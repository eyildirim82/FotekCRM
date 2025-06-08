import { test, expect, Page } from '@playwright/test';

class TestHelper {
  constructor(private page: Page) {}

  async login(email: string = 'test@fotek.com', password: string = 'GüçlüŞifre123!') {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    await expect(this.page).toHaveURL('/dashboard');
  }

  async navigateToModule(moduleName: string) {
    await this.page.click(`text=${moduleName}`);
    await this.page.waitForLoadState('networkidle');
  }

  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      const element = this.page.locator(`[data-testid="${field}"]`);
      const elementType = await element.getAttribute('type');
      
      if (elementType === 'select' || await element.locator('select').count() > 0) {
        await element.selectOption(value);
      } else {
        await element.fill(value);
      }
    }
  }

  async waitForSuccessMessage(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible({ timeout: 10000 });
  }
}

test.describe('Complete Business Flow - Müşteri Yaşam Döngüsü', () => {
  let helper: TestHelper;

  test.beforeEach(async ({ page }) => {
    helper = new TestHelper(page);
    await helper.login();
  });

  test('Tam müşteri yaşam döngüsü - Lead\'den Customer\'a', async ({ page }) => {
    const testData = {
      company: {
        name: 'Entegrasyon Test Teknoloji A.Ş.',
        email: 'info@entegrasyontest.com',
        phone: '+90 212 555 1234',
        industry: 'Technology',
        website: 'https://entegrasyontest.com',
        address: 'Maslak Mahallesi, Test Caddesi No:1',
        city: 'İstanbul',
        country: 'Türkiye',
        status: 'lead'
      },
      contact: {
        firstName: 'Ahmet',
        lastName: 'Entegrasyon',
        email: 'ahmet@entegrasyontest.com',
        phone: '+90 532 555 7890',
        position: 'Genel Müdür'
      },
      product: {
        name: 'Test CRM Yazılımı',
        sku: 'CRM-TEST-001',
        description: 'Entegrasyon testi için özel CRM yazılımı',
        unitPrice: '15000',
        currency: 'TRY',
        category: 'Software',
        stockQuantity: '10'
      }
    };

    // 1. ADIM: YENİ FİRMA OLUŞTUR
    console.log('🏢 Adım 1: Yeni firma oluşturuluyor...');
    
    await helper.navigateToModule('Firmalar');
    await expect(page).toHaveURL(/.*companies.*/);
    
    await page.click('text=Yeni Firma');
    await expect(page).toHaveURL(/.*companies\/new.*/);
    
    await helper.fillForm({
      'company-name': testData.company.name,
      'company-email': testData.company.email,
      'company-phone': testData.company.phone,
      'company-industry': testData.company.industry,
      'company-website': testData.company.website,
      'company-address': testData.company.address,
      'company-city': testData.company.city,
      'company-country': testData.company.country,
      'company-status': testData.company.status
    });
    
    await page.click('[data-testid="save-button"]');
    await helper.waitForSuccessMessage('Firma başarıyla oluşturuldu');
    
    // Firma listesinde oluşturulan firmayı kontrol et
    await expect(page.locator(`text=${testData.company.name}`)).toBeVisible();

    // 2. ADIM: FİRMAYA KİŞİ EKLE
    console.log('👤 Adım 2: Firmaya kişi ekleniyor...');
    
    await helper.navigateToModule('Kişiler');
    await page.click('text=Yeni Kişi');
    
    await helper.fillForm({
      'first-name': testData.contact.firstName,
      'last-name': testData.contact.lastName,
      'email': testData.contact.email,
      'phone': testData.contact.phone,
      'position': testData.contact.position,
      'company-select': testData.company.name
    });
    
    await page.click('[data-testid="save-contact"]');
    await helper.waitForSuccessMessage('Kişi başarıyla oluşturuldu');

    // 3. ADIM: ÜRÜN OLUŞTUR
    console.log('📦 Adım 3: Yeni ürün oluşturuluyor...');
    
    await helper.navigateToModule('Ürünler');
    await page.click('text=Yeni Ürün');
    
    await helper.fillForm({
      'product-name': testData.product.name,
      'product-sku': testData.product.sku,
      'product-description': testData.product.description,
      'unit-price': testData.product.unitPrice,
      'currency': testData.product.currency,
      'category': testData.product.category,
      'stock-quantity': testData.product.stockQuantity
    });
    
    await page.click('[data-testid="save-product"]');
    await helper.waitForSuccessMessage('Ürün başarıyla oluşturuldu');

    // 4. ADIM: SİPARİŞ OLUŞTUR
    console.log('📋 Adım 4: Sipariş oluşturuluyor...');
    
    await helper.navigateToModule('Siparişler');
    await page.click('text=Yeni Sipariş');
    
    // Firma ve kişi seç
    await page.selectOption('[data-testid="order-company"]', testData.company.name);
    await page.waitForTimeout(500); // Kişi listesinin yüklenmesini bekle
    await page.selectOption('[data-testid="order-contact"]', `${testData.contact.firstName} ${testData.contact.lastName}`);
    
    // Ürün ekle
    await page.click('[data-testid="add-product"]');
    await page.selectOption('[data-testid="product-select"]', testData.product.name);
    await page.fill('[data-testid="quantity"]', '2');
    await page.fill('[data-testid="unit-price"]', testData.product.unitPrice);
    
    await page.click('[data-testid="save-order"]');
    await helper.waitForSuccessMessage('Sipariş başarıyla oluşturuldu');
    
    // Sipariş detaylarını kontrol et
    await expect(page.locator('text=Beklemede')).toBeVisible(); // Durum: Pending

    // 5. ADIM: SİPARİŞİ ONAYLA
    console.log('✅ Adım 5: Sipariş onaylanıyor...');
    
    await page.click('[data-testid="confirm-order"]');
    
    // Onay modalını kontrol et ve onayla
    await expect(page.locator('text=Siparişi onaylamak istediğinizden emin misiniz?')).toBeVisible();
    await page.click('[data-testid="confirm-modal-ok"]');
    
    await helper.waitForSuccessMessage('Sipariş onaylandı');
    await expect(page.locator('text=Onaylandı')).toBeVisible();

    // 6. ADIM: FATURA OLUŞTUR
    console.log('🧾 Adım 6: Fatura oluşturuluyor...');
    
    await page.click('[data-testid="create-invoice"]');
    
    // Fatura tarihini ayarla
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    await page.fill('[data-testid="invoice-date"]', today);
    await page.fill('[data-testid="due-date"]', dueDate);
    
    await page.click('[data-testid="save-invoice"]');
    await helper.waitForSuccessMessage('Fatura oluşturuldu');

    // 7. ADIM: FİRMA DURUMUNU CUSTOMER OLARAK GÜNCELLE
    console.log('🎯 Adım 7: Firma durumu Customer olarak güncelleniyor...');
    
    await helper.navigateToModule('Firmalar');
    
    // Oluşturulan firmayı bul ve düzenle
    await page.click(`text=${testData.company.name}`);
    await page.click('[data-testid="edit-company"]');
    
    await page.selectOption('[data-testid="company-status"]', 'customer');
    await page.click('[data-testid="save-button"]');
    await helper.waitForSuccessMessage('Firma başarıyla güncellendi');
    
    // Customer durumunu kontrol et
    await expect(page.locator('text=Müşteri')).toBeVisible();

    // 8. ADIM: DASHBOARD'DA İSTATİSTİKLERİ KONTROL ET
    console.log('📊 Adım 8: Dashboard istatistikleri kontrol ediliyor...');
    
    await helper.navigateToModule('Dashboard');
    
    // Yeni müşteri sayısının artış gösterdiğini kontrol et
    await expect(page.locator('[data-testid="total-customers"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-orders"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    
    // Son aktiviteler listesinde yeni oluşturulanlara ait girdilerin olduğunu kontrol et
    await expect(page.locator(`text=${testData.company.name}`)).toBeVisible();

    console.log('🎉 Müşteri yaşam döngüsü başarıyla tamamlandı!');
  });

  test('Hızlı sipariş akışı - Mevcut müşteri', async ({ page }) => {
    // Bu test mevcut müşteri için hızlı sipariş akışını test eder
    
    console.log('⚡ Hızlı sipariş akışı başlatılıyor...');
    
    await helper.navigateToModule('Siparişler');
    
    // Hızlı sipariş modalını aç
    await page.click('[data-testid="quick-order"]');
    
    // Müşteri ara ve seç
    await page.fill('[data-testid="customer-search"]', 'Test Teknoloji');
    await page.waitForTimeout(500);
    await page.click('[data-testid="customer-result"]:first-child');
    
    // Ürün ara ve ekle
    await page.fill('[data-testid="product-search"]', 'CRM');
    await page.waitForTimeout(500);
    await page.click('[data-testid="product-result"]:first-child');
    
    await page.fill('[data-testid="quick-quantity"]', '1');
    await page.click('[data-testid="add-to-order"]');
    
    // Siparişi kaydet
    await page.click('[data-testid="save-quick-order"]');
    await helper.waitForSuccessMessage('Hızlı sipariş oluşturuldu');
    
    console.log('✅ Hızlı sipariş başarıyla oluşturuldu!');
  });
});

test.describe('Performance & Load Tests', () => {
  test('Sayfalama performans testi', async ({ page }) => {
    const helper = new TestHelper(page);
    await helper.login();
    
    // Firma listesine git
    await helper.navigateToModule('Firmalar');
    
    const startTime = Date.now();
    
    // İlk 5 sayfada gezin
    for (let i = 1; i <= 5; i++) {
      await page.click(`[data-testid="pagination"] >> text=${i}`);
      await page.waitForLoadState('networkidle');
      
      // Her sayfa yüklemesi 2 saniyeden az sürmeli
      const pageLoadTime = Date.now() - startTime;
      expect(pageLoadTime).toBeLessThan(2000);
    }
  });

  test('Arama performans testi', async ({ page }) => {
    const helper = new TestHelper(page);
    await helper.login();
    
    await helper.navigateToModule('Firmalar');
    
    const searchTerms = ['Test', 'Tech', 'A.Ş.', 'Ltd'];
    
    for (const term of searchTerms) {
      const startTime = Date.now();
      
      await page.fill('[data-testid="search-input"]', term);
      await page.click('[data-testid="search-button"]');
      await page.waitForLoadState('networkidle');
      
      const searchTime = Date.now() - startTime;
      expect(searchTime).toBeLessThan(1000); // 1 saniyeden az
      
      // Sonuçların görüntülendiğini kontrol et
      await expect(page.locator('[data-testid="company-list-table"]')).toBeVisible();
    }
  });
});

test.describe('Error Handling & Edge Cases', () => {
  test('Network hatası durumunda kullanıcı deneyimi', async ({ page }) => {
    const helper = new TestHelper(page);
    await helper.login();
    
    // Network'ü offline yap
    await page.context().setOffline(true);
    
    await helper.navigateToModule('Firmalar');
    await page.click('text=Yeni Firma');
    
    await helper.fillForm({
      'company-name': 'Offline Test Firma',
      'company-email': 'offline@test.com'
    });
    
    await page.click('[data-testid="save-button"]');
    
    // Hata mesajını kontrol et
    await expect(page.locator('text=Bağlantı hatası')).toBeVisible();
    
    // Network'ü tekrar online yap
    await page.context().setOffline(false);
    
    // Retry butonu çalışmalı
    await page.click('[data-testid="retry-button"]');
    await helper.waitForSuccessMessage('Firma başarıyla oluşturuldu');
  });

  test('Çok büyük veri girişi edge case', async ({ page }) => {
    const helper = new TestHelper(page);
    await helper.login();
    
    await helper.navigateToModule('Firmalar');
    await page.click('text=Yeni Firma');
    
    // Çok uzun firma adı
    const longName = 'A'.repeat(500);
    await page.fill('[data-testid="company-name"]', longName);
    
    await page.click('[data-testid="save-button"]');
    
    // Validation hatası gösterilmeli
    await expect(page.locator('text=Firma adı çok uzun')).toBeVisible();
  });
});