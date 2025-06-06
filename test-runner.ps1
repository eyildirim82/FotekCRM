#!/usr/bin/env powershell
# 🧪 S-6 Contact Management System Test Runner
# Usage: .\test-runner.ps1

Write-Host "🧪 Starting S-6 Contact Management System Tests..." -ForegroundColor Cyan
Write-Host "=" * 60

# Test Results Counter
$totalTests = 0
$passedTests = 0
$failedTests = 0

function Test-API {
    param($TestName, $ScriptBlock)
    
    $global:totalTests++
    Write-Host "`n🔍 Testing: $TestName" -ForegroundColor Yellow
    
    try {
        & $ScriptBlock
        $global:passedTests++
        Write-Host "✅ $TestName PASSED" -ForegroundColor Green
        return $true
    }
    catch {
        $global:failedTests++
        Write-Host "❌ $TestName FAILED: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 1. Container Health Check
Test-API "Container Health Check" {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}"
    if ($containers -match "fotek_api.*healthy" -and $containers -match "fotek_db.*healthy") {
        Write-Host "   All containers are healthy"
    } else {
        throw "Some containers are not healthy"
    }
}

# 2. Authentication Test
$token = $null
Test-API "Authentication and JWT Token" {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
        -Method POST -ContentType "application/json" `
        -Body '{"email":"test@fotek.com","password":"Test123!"}'
    
    $global:token = $response.access_token
    if ($token -and $token.Length -gt 100) {
        Write-Host "   Token length: $($token.Length) characters"
    } else {
        throw "Invalid token received"
    }
}

# 3. Contact Statistics Test
Test-API "Contact Statistics API" {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts/stats" `
        -Headers @{"Authorization"="Bearer $token"}
    
    if ($response.success -eq $true) {
        Write-Host "   Total contacts: $($response.data.total)"
        Write-Host "   Active contacts: $($response.data.active)"
    } else {
        throw "Statistics API returned error"
    }
}

# 4. Contact List Test
Test-API "Contact List API" {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts" `
        -Headers @{"Authorization"="Bearer $token"}
    
    if ($response.success -eq $true -and $response.data.contacts -is [array]) {
        Write-Host "   Contacts found: $($response.data.contacts.Count)"
        Write-Host "   Pagination: Page $($response.data.pagination.page)/$($response.data.pagination.pages)"
    } else {
        throw "Contact list API returned error"
    }
}

# 5. Company List Test
Test-API "Company List API" {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/companies" `
        -Headers @{"Authorization"="Bearer $token"}
    
    if ($response.success -eq $true -and $response.data.companies -is [array]) {
        Write-Host "   Companies found: $($response.data.companies.Count)"
    } else {
        throw "Company list API returned error"
    }
}

# 6. Frontend Application Test
Test-API "Frontend Application" {
    $response = Invoke-WebRequest -Uri "http://localhost:80" -Method GET -UseBasicParsing
    
    if ($response.StatusCode -eq 200 -and $response.Content -match "<!DOCTYPE html>") {
        Write-Host "   Frontend served successfully (HTTP $($response.StatusCode))"
    } else {
        throw "Frontend not accessible"
    }
}

# 7. API Health Check Test
Test-API "API Health Endpoint" {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
    
    if ($response.status -eq "OK") {
        Write-Host "   Service: $($response.service)"
        Write-Host "   Version: $($response.version)"
    } else {
        throw "Health check failed"
    }
}

# 8. Performance Test
Test-API "API Performance" {
    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/contacts/stats" `
        -Headers @{"Authorization"="Bearer $token"}
    $endTime = Get-Date
    
    $responseTime = ($endTime - $startTime).TotalMilliseconds
    
    if ($responseTime -lt 1000) {
        Write-Host "   Response time: $([math]::Round($responseTime, 2))ms"
    } else {
        throw "Response time too slow: $([math]::Round($responseTime, 2))ms"
    }
}

# 9. Authorization Test
Test-API "API Authorization" {
    try {
        Invoke-RestMethod -Uri "http://localhost:3000/api/contacts" -Method GET
        throw "Should have failed without authorization"
    }
    catch {
        if ($_.Exception.Message -match "401|Unauthorized") {
            Write-Host "   Correctly rejected unauthorized request"
        } else {
            throw "Unexpected error: $($_.Exception.Message)"
        }
    }
}

# 10. Frontend Build Test
Test-API "Frontend Build Verification" {
    if (Test-Path "frontend/dist") {
        $buildFiles = Get-ChildItem "frontend/dist" -Recurse | Measure-Object
        Write-Host "   Build directory exists with $($buildFiles.Count) files"
    } else {
        throw "Frontend build directory not found"
    }
}

# Test Summary
Write-Host "`n" + "=" * 60
Write-Host "🎯 S-6 Test Results Summary" -ForegroundColor Cyan
Write-Host "=" * 60

Write-Host "📊 Total Tests: $totalTests" -ForegroundColor White
Write-Host "✅ Passed: $passedTests" -ForegroundColor Green
Write-Host "❌ Failed: $failedTests" -ForegroundColor Red

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
Write-Host "📈 Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

if ($failedTests -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! S-6 Contact Management System is PRODUCTION READY! 🚀" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Please check the issues above." -ForegroundColor Yellow
}

Write-Host "`n🔗 Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:80"
Write-Host "   API: http://localhost:3000"
Write-Host "   API Health: http://localhost:3000/api/health"

Write-Host "`nTest completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray 