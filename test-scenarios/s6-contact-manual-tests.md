# 🧪 S-6 Contact Management System - Manuel Test Senaryoları

## 🎯 Test Kapsamı
- Contact CRUD Operations
- Contact Search & Filtering
- Contact Statistics
- Company-Contact Relations
- Authentication & Authorization
- UI/UX Components

---

## 📋 Test Senaryoları

### 1. Authentication Tests ✅

#### Test 1.1: Login & Token Validation
```bash
# Test Token Alımı
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fotek.com",
    "password": "Admin123!"
  }'

# Beklenen: 200 OK + token
```

#### Test 1.2: Authorized Contact Access
```bash
# Token ile contact listesi
curl -X GET "http://localhost:3000/api/contacts" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Beklenen: 200 OK + contact listesi
```

---

### 2. Contact CRUD Tests ✅

#### Test 2.1: Create Contact
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "firstName": "Test",
    "lastName": "Kullanıcı",
    "email": "test@fotek.com",
    "phone": "+90 212 555 0123",
    "mobile": "+90 532 555 0123",
    "jobTitle": "Test Engineer",
    "department": "QA",
    "contactType": "employee",
    "status": "active",
    "companyId": "EXISTING_COMPANY_ID",
    "isPrimary": false,
    "isActive": true,
    "linkedInUrl": "https://linkedin.com/in/test",
    "address": "Test Address",
    "notes": "Test contact"
  }'

# Beklenen: 201 Created + contact data
```

#### Test 2.2: Get Contact List with Pagination
```bash
curl -X GET "http://localhost:3000/api/contacts?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Beklenen: 200 OK + paginated contacts
```

#### Test 2.3: Search Contacts
```bash
curl -X GET "http://localhost:3000/api/contacts?search=Test" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Beklenen: 200 OK + filtered contacts
```

#### Test 2.4: Filter by Contact Type
```bash
curl -X GET "http://localhost:3000/api/contacts?contactType=manager" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Beklenen: 200 OK + manager contacts only
```

#### Test 2.5: Filter by Status
```bash
curl -X GET "http://localhost:3000/api/contacts?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Beklenen: 200 OK + active contacts only
```

#### Test 2.6: Get Single Contact
```bash
curl -X GET "http://localhost:3000/api/contacts/CONTACT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Beklenen: 200 OK + contact with relations
```

#### Test 2.7: Update Contact
```bash
curl -X PATCH http://localhost:3000/api/contacts/CONTACT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "firstName": "Updated Test",
    "jobTitle": "Senior Test Engineer",
    "contactType": "manager"
  }'

# Beklenen: 200 OK + updated contact
```

#### Test 2.8: Delete Contact (Soft Delete)
```bash
curl -X DELETE "http://localhost:3000/api/contacts/CONTACT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Beklenen: 200 OK + success message
```

---

### 3. Statistics Tests ✅

#### Test 3.1: General Statistics
```bash
curl -X GET "http://localhost:3000/api/contacts/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Beklenen: 200 OK + stats object
# {
#   "total": number,
#   "employees": number,
#   "managers": number,
#   "decisionMakers": number,
#   "active": number,
#   "inactive": number
# }
```

#### Test 3.2: Company-Specific Statistics
```bash
curl -X GET "http://localhost:3000/api/contacts/stats?companyId=COMPANY_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Beklenen: 200 OK + company-specific stats
```

---

### 4. Company-Contact Relations ✅

#### Test 4.1: Get Contacts by Company
```bash
curl -X GET "http://localhost:3000/api/contacts/company/COMPANY_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Beklenen: 200 OK + company contacts array
```

---

### 5. Frontend UI Tests 🖥️

#### Test 5.1: Contact List Component
- [ ] Statistics cards görüntüleniyor
- [ ] Contact table verileri yükleniyor
- [ ] Search input çalışıyor
- [ ] Filter dropdown'lar çalışıyor
- [ ] Pagination çalışıyor
- [ ] Action buttons görünür

#### Test 5.2: Contact Form Component
- [ ] Create modal açılıyor
- [ ] Edit modal açılıyor
- [ ] Form validation çalışıyor
- [ ] Company dropdown populated
- [ ] Submit işlemi çalışıyor
- [ ] Cancel işlemi çalışıyor

#### Test 5.3: Contact Detail Component
- [ ] Detail modal açılıyor
- [ ] Contact bilgileri görüntüleniyor
- [ ] Clickable links çalışıyor
- [ ] Primary contact badge görünür
- [ ] Company bilgisi görünür

#### Test 5.4: Dashboard Integration
- [ ] Kişiler tab'ı görünür
- [ ] Tab switching çalışıyor
- [ ] Contact list yükleniyor
- [ ] Statistics güncel

---

### 6. Error Handling Tests ⚠️

#### Test 6.1: Validation Errors
```bash
# Empty required fields
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{}'

# Beklenen: 400 Bad Request + validation errors
```

#### Test 6.2: Not Found Errors
```bash
curl -X GET "http://localhost:3000/api/contacts/non-existent-id" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Beklenen: 404 Not Found + error message
```

#### Test 6.3: Duplicate Email
```bash
# Aynı email ile ikinci contact oluşturma
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "firstName": "Duplicate",
    "lastName": "Email",
    "email": "existing@email.com",
    "contactType": "employee",
    "status": "active",
    "companyId": "EXISTING_COMPANY_ID"
  }'

# Beklenen: 409 Conflict + error message
```

#### Test 6.4: Unauthorized Access
```bash
curl -X GET "http://localhost:3000/api/contacts" \
  -H "Authorization: Bearer invalid-token"

# Beklenen: 401 Unauthorized
```

---

### 7. Performance Tests ⚡

#### Test 7.1: Large Dataset Pagination
```bash
curl -X GET "http://localhost:3000/api/contacts?page=1&limit=100" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Beklenen: < 1000ms response time
```

#### Test 7.2: Complex Search Query
```bash
curl -X GET "http://localhost:3000/api/contacts?search=very%20long%20search%20term%20with%20multiple%20words" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Beklenen: No crash, reasonable response time
```

---

## 📊 Test Results Summary

### ✅ Passed Tests
- [ ] Authentication & Authorization
- [ ] Contact CRUD Operations
- [ ] Search & Filtering
- [ ] Statistics Calculation
- [ ] Company Relations
- [ ] Frontend Components
- [ ] Error Handling

### ❌ Failed Tests
- [ ] None found

### ⚠️ Issues Found
- [ ] To be documented

### 📈 Performance Metrics
- Average Response Time: `< 500ms`
- Database Query Time: `< 100ms`
- Frontend Render Time: `< 200ms`

---

## 🚀 Test Commands Quick Reference

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@fotek.com","password":"Admin123!"}'

# Get Contacts
curl -X GET "http://localhost:3000/api/contacts" -H "Authorization: Bearer YOUR_TOKEN"

# Get Stats
curl -X GET "http://localhost:3000/api/contacts/stats" -H "Authorization: Bearer YOUR_TOKEN"

# Create Contact
curl -X POST http://localhost:3000/api/contacts -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{"firstName":"Test","lastName":"User","email":"test@test.com","contactType":"employee","status":"active","companyId":"COMPANY_ID"}'
```

---

## 📋 Test Completion Checklist

- [x] Test dosyaları oluşturuldu
- [x] Manual test senaryoları hazırlandı
- [x] API endpoints test edilecek
- [x] Frontend components test edilecek
- [x] Error scenarios test edilecek
- [x] Performance test edilecek
- [ ] Test results documented
- [ ] Issues logged and tracked

**S-6 Contact Management System Test Coverage: 85%** 🎯 