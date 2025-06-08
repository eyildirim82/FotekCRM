# FotekCRM Test Runner - Fixed Version
param(
    [string]$TestType = "integration",
    [switch]$Fix = $false,
    [switch]$SkipDocker = $false
)

function Write-TestHeader {
    param([string]$Message)
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host " $Message" -ForegroundColor Yellow  
    Write-Host "============================================" -ForegroundColor Cyan
}

function Write-TestStep {
    param([string]$Message)
    Write-Host ""
    Write-Host "[STEP] $Message" -ForegroundColor Green
}

function Write-TestError {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-TestSuccess {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-TestWarning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

Write-TestHeader "FotekCRM Test Runner"

# Docker check function
function Test-DockerServices {
    Write-TestStep "Docker containers kontrol ediliyor..."
    
    try {
        $containers = docker ps --format "{{.Names}}" | Where-Object { $_ -like "*fotek*" }
        
        if ($containers.Count -eq 0) {
            Write-TestError "Hicbir FotekCRM container calismiyor!"
            return $false
        }
        
        Write-Host "Running containers:" -ForegroundColor Gray
        $containers | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        
        Write-TestSuccess "Docker containers calisiyor"
        return $true
    } catch {
        Write-TestError "Docker kontrol hatasi: $($_.Exception.Message)"
        return $false
    }
}

# Wait for services
function Wait-ForServices {
    Write-TestStep "API servisinin hazir olmasini bekliyor..."
    
    $maxAttempts = 30
    $delay = 2
    
    for ($i = 1; $i -le $maxAttempts; $i++) {
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 5
            if ($response.status -eq "OK") {
                Write-TestSuccess "API servisi hazir ($i. deneme)"
                return $true
            }
        } catch {
            Write-Host "  API bekleniyor... ($i/$maxAttempts)" -ForegroundColor Gray
            Start-Sleep $delay
        }
    }
    
    Write-TestError "API servisi $maxAttempts deneme sonrasi hazir degil"
    return $false
}

# Run tests
function Start-Tests {
    param([string]$Type)
    
    Write-TestStep "$Type testleri calistiriliyor..."
    
    try {
        $env:NODE_ENV = "test"
        $env:API_URL = "http://localhost:3000"
        
        switch ($Type.ToLower()) {
            "integration" {
                npm run test:integration
            }
            "unit" {
                npm run test
            }
            "e2e" {
                npm run test:e2e
            }
            "all" {
                Write-Host "Unit testleri calistiriliyor..." -ForegroundColor Yellow
                npm run test
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "Integration testleri calistiriliyor..." -ForegroundColor Yellow
                    npm run test:integration
                }
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "E2E testleri calistiriliyor..." -ForegroundColor Yellow
                    npm run test:e2e
                }
            }
            default {
                Write-TestError "Gecersiz test turu: $Type"
                return $false
            }
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-TestSuccess "$Type testleri basariyla tamamlandi"
            return $true
        } else {
            Write-TestError "$Type testlerinde hata olustu (Exit Code: $LASTEXITCODE)"
            return $false
        }
    } catch {
        Write-TestError "Test calistirma hatasi: $($_.Exception.Message)"
        return $false
    }
}

# Fix common issues
function Fix-TestIssues {
    Write-TestStep "Test problemleri duzeltiliyor..."
    
    if (Test-Path "jest.config.ts") {
        Write-Host "Jest config kontrol ediliyor..." -ForegroundColor Gray
        $jestConfig = Get-Content "jest.config.ts" -Raw
        
        if ($jestConfig -like "*globals*") {
            Write-TestWarning "Jest config'de deprecated globals kullanimi tespit edildi"
            Write-Host "Manuel fix onerisi: jest.config.ts'de globals yerine transform syntax kullanin" -ForegroundColor Yellow
        }
    }
    
    Write-Host "Dependencies kontrol ediliyor..." -ForegroundColor Gray
    try {
        npm list --depth=0 | Out-Null
        Write-TestSuccess "Dependencies kontrolu tamamlandi"
    } catch {
        Write-TestWarning "Bazi dependencies eksik olabilir"
    }
}

# Main execution
try {
    # Docker check (if not skipped)
    if (!$SkipDocker) {
        $dockerOk = Test-DockerServices
        if (!$dockerOk) {
            Write-TestError "Docker servisleri calismiyor. Cozum:"
            Write-Host "  1. docker compose up -d" -ForegroundColor Yellow
            Write-Host "  2. 60 saniye bekle" -ForegroundColor Yellow
            Write-Host "  3. Bu script'i tekrar calistir" -ForegroundColor Yellow
            Write-Host "  VEYA: -SkipDocker parametresi ile Docker kontrolunu atla" -ForegroundColor Yellow
            exit 1
        }
        
        $servicesReady = Wait-ForServices
        if (!$servicesReady) {
            Write-TestError "Servisler hazir degil. Manuel kontrol onerileri:"
            Write-Host "  1. docker compose logs fotek_api" -ForegroundColor Yellow
            Write-Host "  2. docker compose logs fotek_db" -ForegroundColor Yellow
            Write-Host "  3. http://localhost:3000/api/health adresini kontrol et" -ForegroundColor Yellow
            exit 1
        }
    }
    
    # Fix issues if requested
    if ($Fix) {
        Fix-TestIssues
    }
    
    # Run tests
    $testSuccess = Start-Tests $TestType
    
    if ($testSuccess) {
        Write-TestHeader "Testler Basariyla Tamamlandi!"
        Write-Host "Test turu: $TestType" -ForegroundColor Green
        Write-Host "Tum kontroller gecti" -ForegroundColor Green
        exit 0
    } else {
        Write-TestHeader "Testlerde Sorun Var"
        Write-Host "Debug onerileri:" -ForegroundColor Yellow
        Write-Host "  1. .\test-runner-fix.ps1 -TestType $TestType -Fix" -ForegroundColor Gray
        Write-Host "  2. docker compose logs fotek_api" -ForegroundColor Gray
        Write-Host "  3. Test dosyalarindaki data yapisini kontrol et" -ForegroundColor Gray
        exit 1
    }
    
} catch {
    Write-TestError "Script hatasi: $($_.Exception.Message)"
    Write-Host "Stack trace:" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}

# Usage examples
Write-Host ""
Write-Host "Kullanim Ornekleri:" -ForegroundColor Cyan
Write-Host "  .\test-runner-fix.ps1                        # Integration testleri calistir" -ForegroundColor Gray
Write-Host "  .\test-runner-fix.ps1 -TestType unit         # Unit testleri calistir" -ForegroundColor Gray
Write-Host "  .\test-runner-fix.ps1 -TestType all -Fix     # Tum testler + problemleri duzelt" -ForegroundColor Gray
Write-Host "  .\test-runner-fix.ps1 -SkipDocker            # Docker kontrolu olmadan" -ForegroundColor Gray 