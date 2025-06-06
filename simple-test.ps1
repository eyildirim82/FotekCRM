Write-Host "🧪 S-6 Contact Management System Quick Tests" -ForegroundColor Cyan
Write-Host "=" * 50

# Test 1: Authentication
Write-Host "`n🔍 Test 1: Authentication" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@fotek.com","password":"Test123!"}'
    $token = $response.access_token
    Write-Host "✅ Authentication PASSED - Token Length: $($token.Length)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Authentication FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Contact Stats
Write-Host "`n🔍 Test 2: Contact Statistics" -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts/stats" -Headers @{"Authorization"="Bearer $token"}
    Write-Host "✅ Contact Stats PASSED - Total: $($statsResponse.data.total)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Contact Stats FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Contact List
Write-Host "`n🔍 Test 3: Contact List" -ForegroundColor Yellow
try {
    $contactsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts" -Headers @{"Authorization"="Bearer $token"}
    Write-Host "✅ Contact List PASSED - Found: $($contactsResponse.data.contacts.Count)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Contact List FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Company List
Write-Host "`n🔍 Test 4: Company List" -ForegroundColor Yellow
try {
    $companiesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/companies" -Headers @{"Authorization"="Bearer $token"}
    Write-Host "✅ Company List PASSED - Found: $($companiesResponse.data.companies.Count)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Company List FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Frontend
Write-Host "`n🔍 Test 5: Frontend Application" -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:80" -Method GET -UseBasicParsing
    Write-Host "✅ Frontend PASSED - Status: $($frontendResponse.StatusCode)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Frontend FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nS-6 Quick Tests Completed!" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:80" -ForegroundColor Blue
Write-Host "API: http://localhost:3000" -ForegroundColor Blue 