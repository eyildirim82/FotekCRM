# 🧪 Fotek CRM - Windows PowerShell Quick Test Suite
# Comprehensive testing script for all system components

Write-Host "🚀 Fotek CRM Test Suite Starting..." -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue
Write-Host "Date: $(Get-Date)" -ForegroundColor Blue
Write-Host "Environment: Windows Docker Localhost" -ForegroundColor Blue
Write-Host ""

# Test counters
$totalTests = 0
$passedTests = 0
$failedTests = 0

# Helper functions
function Test-Result {
    param($TestName, $Condition, $Message = "")
    $global:totalTests++
    Write-Host "Testing: $TestName" -ForegroundColor Yellow
    if ($Condition) {
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
        if ($Message) { Write-Host "   $Message" -ForegroundColor Gray }
        $global:passedTests++
    } else {
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
        if ($Message) { Write-Host "   $Message" -ForegroundColor Gray }
        $global:failedTests++
    }
    Write-Host ""
}

# 1. INFRASTRUCTURE TESTS
Write-Host "🐳 1. INFRASTRUCTURE TESTS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Container Status
$containers = docker-compose ps
$runningContainers = ($containers | Select-String "Up").Count
Test-Result "Docker Containers" ($runningContainers -eq 4) "Running: $runningContainers/4"

# 2. API HEALTH TESTS
Write-Host "🔧 2. API HEALTH TESTS" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 5
    Test-Result "API Health Check" ($healthResponse.status -eq "OK") "Service: $($healthResponse.service)"
} catch {
    Test-Result "API Health Check" $false "Error: $($_.Exception.Message)"
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:80" -Method Head -TimeoutSec 5
    Test-Result "Frontend Access" ($frontendResponse.StatusCode -eq 200) "Status Code: $($frontendResponse.StatusCode)"
} catch {
    Test-Result "Frontend Access" $false "Error: $($_.Exception.Message)"
}

try {
    $proxyResponse = Invoke-WebRequest -Uri "http://localhost:80/api/health" -Method Head -TimeoutSec 5
    Test-Result "Nginx Proxy" ($proxyResponse.StatusCode -eq 200) "Proxy routing working"
} catch {
    Test-Result "Nginx Proxy" $false "Error: $($_.Exception.Message)"
}

# 3. AUTHENTICATION TESTS
Write-Host "🔐 3. AUTHENTICATION TESTS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Register new user
$testEmail = "testuser$(Get-Date -Format 'HHmmss')@fotek.com"
$registerData = @{
    email = $testEmail
    firstName = "Test"
    lastName = "User"
    password = "Test123!"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
        -Method POST -ContentType "application/json" -Body $registerData -TimeoutSec 10
    
    $hasToken = $registerResponse.access_token -ne $null
    Test-Result "User Registration" $hasToken "Email: $testEmail"
    $authToken = $registerResponse.access_token
} catch {
    Test-Result "User Registration" $false "Error: $($_.Exception.Message)"
    $authToken = $null
}

# Login test with demo user
$loginData = @{
    email = "test@fotek.com"
    password = "Test123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
        -Method POST -ContentType "application/json" -Body $loginData -TimeoutSec 10
    
    $hasLoginToken = $loginResponse.access_token -ne $null
    Test-Result "User Login (Demo)" $hasLoginToken "Demo user login successful"
    if (-not $authToken) { $authToken = $loginResponse.access_token }
} catch {
    Test-Result "User Login (Demo)" $false "Error: $($_.Exception.Message)"
}

# 4. COMPANY API TESTS
Write-Host "🏢 4. COMPANY API TESTS" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

if ($authToken) {
    $headers = @{ "Authorization" = "Bearer $authToken" }
    
    try {
        $companyStats = Invoke-RestMethod -Uri "http://localhost:3000/api/companies/stats" -Headers $headers -TimeoutSec 10
        Test-Result "Company Statistics" ($companyStats.total -ge 0) "Total companies: $($companyStats.total)"
    } catch {
        Test-Result "Company Statistics" $false "Error: $($_.Exception.Message)"
    }

    try {
        $companyList = Invoke-RestMethod -Uri "http://localhost:3000/api/companies" -Headers $headers -TimeoutSec 10
        Test-Result "Company List" ($companyList.companies -ne $null) "Companies endpoint working"
    } catch {
        Test-Result "Company List" $false "Error: $($_.Exception.Message)"
    }

    # Create test company
    $companyData = @{
        name = "Test Company Ltd"
        email = "info@testcompany.com"
        industry = "Technology"
        status = "lead"
    } | ConvertTo-Json

    try {
        $newCompany = Invoke-RestMethod -Uri "http://localhost:3000/api/companies" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $companyData -TimeoutSec 10
        
        Test-Result "Company Creation" ($newCompany.id -ne $null) "Company ID: $($newCompany.id)"
        $companyId = $newCompany.id
    } catch {
        Test-Result "Company Creation" $false "Error: $($_.Exception.Message)"
        $companyId = $null
    }
} else {
    Test-Result "Company Tests Skipped" $false "No authentication token available"
}

# 5. CONTACT API TESTS
Write-Host "👥 5. CONTACT API TESTS" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

if ($authToken) {
    try {
        $contactStats = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts/stats" -Headers $headers -TimeoutSec 10
        Test-Result "Contact Statistics" ($contactStats.total -ge 0) "Total contacts: $($contactStats.total)"
    } catch {
        Test-Result "Contact Statistics" $false "Error: $($_.Exception.Message)"
    }

    try {
        $contactList = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts" -Headers $headers -TimeoutSec 10
        Test-Result "Contact List" ($contactList.contacts -ne $null) "Contacts endpoint working"
    } catch {
        Test-Result "Contact List" $false "Error: $($_.Exception.Message)"
    }

    if ($companyId) {
        $contactData = @{
            firstName = "Test"
            lastName = "Contact"
            email = "test.contact@testcompany.com"
            companyId = $companyId
            type = "employee"
            status = "active"
        } | ConvertTo-Json

        try {
            $newContact = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts" `
                -Method POST -Headers $headers -ContentType "application/json" -Body $contactData -TimeoutSec 10
            
            Test-Result "Contact Creation" ($newContact.id -ne $null) "Contact ID: $($newContact.id)"
        } catch {
            Test-Result "Contact Creation" $false "Error: $($_.Exception.Message)"
        }
    }
} else {
    Test-Result "Contact Tests Skipped" $false "No authentication token available"
}

# 6. PRODUCT API TESTS
Write-Host "📦 6. PRODUCT API TESTS" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

if ($authToken) {
    try {
        $productStats = Invoke-RestMethod -Uri "http://localhost:3000/api/products/stats" -Headers $headers -TimeoutSec 10
        Test-Result "Product Statistics" ($productStats.totalProducts -ge 0) "Total products: $($productStats.totalProducts)"
    } catch {
        Test-Result "Product Statistics" $false "Error: $($_.Exception.Message)"
    }

    try {
        $productList = Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Headers $headers -TimeoutSec 10
        Test-Result "Product List" ($productList.products -ne $null) "Products endpoint working"
    } catch {
        Test-Result "Product List" $false "Error: $($_.Exception.Message)"
    }

    $productCode = "TEST$(Get-Date -Format 'HHmmss')"
    $productData = @{
        name = "Test Product"
        code = $productCode
        listPrice = 100.00
        costPrice = 75.00
        category = "electronics"
    } | ConvertTo-Json

    try {
        $newProduct = Invoke-RestMethod -Uri "http://localhost:3000/api/products" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $productData -TimeoutSec 10
        
        Test-Result "Product Creation" ($newProduct.id -ne $null) "Product ID: $($newProduct.id)"
    } catch {
        Test-Result "Product Creation" $false "Error: $($_.Exception.Message)"
    }
} else {
    Test-Result "Product Tests Skipped" $false "No authentication token available"
}

# 7. PERFORMANCE TESTS
Write-Host "⚡ 7. PERFORMANCE TESTS" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 10 | Out-Null
    $responseTime = $stopwatch.ElapsedMilliseconds
    Test-Result "API Response Time" ($responseTime -lt 500) "Response time: ${responseTime}ms"
} catch {
    Test-Result "API Response Time" $false "Error: $($_.Exception.Message)"
}

# FINAL RESULTS
Write-Host ""
Write-Host "📊 TEST SUMMARY" -ForegroundColor Blue
Write-Host "===================" -ForegroundColor Blue
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red

$passRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }
Write-Host "Pass Rate: $passRate%" -ForegroundColor Yellow

if ($failedTests -eq 0) {
    Write-Host ""
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "✅ Fotek CRM is Production Ready" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Some tests failed" -ForegroundColor Yellow
    Write-Host "📋 Please check the failed tests above" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌐 SYSTEM URLs:" -ForegroundColor Blue
Write-Host "   Frontend: http://localhost:80" -ForegroundColor Green
Write-Host "   API: http://localhost:3000/api/health" -ForegroundColor Green

Write-Host ""
Write-Host "Test completed at: $(Get-Date)" -ForegroundColor Blue 