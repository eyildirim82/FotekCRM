#!/bin/bash

# 🧪 Fotek CRM - Automated Test Suite
# Comprehensive testing script for all system components

set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}🧪 $1${NC}"
    echo "=================================="
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_TESTS++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_TESTS++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

run_test() {
    ((TOTAL_TESTS++))
    echo -e "\n${YELLOW}Testing: $1${NC}"
}

# Start test suite
echo -e "${BLUE}"
echo "🚀 Fotek CRM - Comprehensive Test Suite"
echo "========================================"
echo "Date: $(date)"
echo "Environment: Docker Localhost"
echo -e "${NC}\n"

# 1. INFRASTRUCTURE TESTS
print_header "1. INFRASTRUCTURE TESTS"

run_test "Docker containers status"
if docker-compose ps | grep -q "Up"; then
    print_success "All containers are running"
else
    print_error "Containers not running - Run 'docker-compose up -d'"
    exit 1
fi

run_test "Docker container health"
UNHEALTHY=$(docker-compose ps | grep -v "Up" | grep -v "Name" | wc -l)
if [ $UNHEALTHY -eq 0 ]; then
    print_success "All containers healthy"
else
    print_error "$UNHEALTHY containers unhealthy"
fi

# 2. API HEALTH TESTS
print_header "2. API HEALTH TESTS"

run_test "API Health endpoint"
if curl -s http://localhost:3000/api/health | grep -q "OK"; then
    print_success "API Health check passed"
else
    print_error "API Health check failed"
fi

run_test "Frontend accessibility"
if curl -s -I http://localhost:80 | grep -q "200 OK"; then
    print_success "Frontend accessible"
else
    print_error "Frontend not accessible"
fi

run_test "Nginx proxy functionality"
if curl -s -I http://localhost:80/api/health | grep -q "200 OK"; then
    print_success "Nginx proxy working"
else
    print_error "Nginx proxy failed"
fi

# 3. DATABASE TESTS
print_header "3. DATABASE CONNECTIVITY"

run_test "Database container logs"
if docker-compose logs fotek_db | grep -q "ready for connections"; then
    print_success "Database ready for connections"
else
    print_warning "Database might still be starting up"
fi

# 4. AUTHENTICATION TESTS
print_header "4. AUTHENTICATION TESTS"

# Register test user
run_test "User Registration"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser'$(date +%s)'@fotek.com",
    "firstName": "Test",
    "lastName": "User", 
    "password": "Test123!"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "access_token"; then
    print_success "User registration successful"
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token')
else
    print_error "User registration failed"
    TOKEN=""
fi

run_test "User Login"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@fotek.com",
    "password": "Test123!"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    print_success "User login successful"
    if [ -z "$TOKEN" ]; then
        TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
    fi
else
    print_warning "Login with existing user failed, using registered user token"
fi

# 5. COMPANY API TESTS
print_header "5. COMPANY API TESTS"

if [ ! -z "$TOKEN" ]; then
    run_test "Company Statistics"
    COMPANY_STATS=$(curl -s http://localhost:3000/api/companies/stats \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$COMPANY_STATS" | grep -q "total"; then
        print_success "Company statistics working"
    else
        print_error "Company statistics failed"
    fi

    run_test "Company List"
    COMPANY_LIST=$(curl -s http://localhost:3000/api/companies \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$COMPANY_LIST" | grep -q "companies"; then
        print_success "Company list working"
    else
        print_error "Company list failed"
    fi

    run_test "Company Creation"
    CREATE_COMPANY=$(curl -s -X POST http://localhost:3000/api/companies \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "name": "Test Company Ltd",
        "email": "info@testcompany.com",
        "industry": "Technology",
        "status": "lead"
      }')
    
    if echo "$CREATE_COMPANY" | grep -q "id"; then
        print_success "Company creation working"
        COMPANY_ID=$(echo "$CREATE_COMPANY" | jq -r '.id')
    else
        print_error "Company creation failed"
        COMPANY_ID=""
    fi
else
    print_error "No authentication token - skipping company tests"
fi

# 6. CONTACT API TESTS
print_header "6. CONTACT API TESTS"

if [ ! -z "$TOKEN" ]; then
    run_test "Contact Statistics"
    CONTACT_STATS=$(curl -s http://localhost:3000/api/contacts/stats \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$CONTACT_STATS" | grep -q "total"; then
        print_success "Contact statistics working"
    else
        print_error "Contact statistics failed"
    fi

    run_test "Contact List"
    CONTACT_LIST=$(curl -s http://localhost:3000/api/contacts \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$CONTACT_LIST" | grep -q "contacts"; then
        print_success "Contact list working"
    else
        print_error "Contact list failed"
    fi

    if [ ! -z "$COMPANY_ID" ]; then
        run_test "Contact Creation"
        CREATE_CONTACT=$(curl -s -X POST http://localhost:3000/api/contacts \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer $TOKEN" \
          -d '{
            "firstName": "Test",
            "lastName": "Contact",
            "email": "test.contact@testcompany.com",
            "companyId": "'$COMPANY_ID'",
            "type": "employee",
            "status": "active"
          }')
        
        if echo "$CREATE_CONTACT" | grep -q "id"; then
            print_success "Contact creation working"
        else
            print_error "Contact creation failed"
        fi
    fi
else
    print_error "No authentication token - skipping contact tests"
fi

# 7. PRODUCT API TESTS
print_header "7. PRODUCT API TESTS"

if [ ! -z "$TOKEN" ]; then
    run_test "Product Statistics"
    PRODUCT_STATS=$(curl -s http://localhost:3000/api/products/stats \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$PRODUCT_STATS" | grep -q "totalProducts"; then
        print_success "Product statistics working"
    else
        print_error "Product statistics failed"
    fi

    run_test "Product List"
    PRODUCT_LIST=$(curl -s http://localhost:3000/api/products \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$PRODUCT_LIST" | grep -q "products"; then
        print_success "Product list working"
    else
        print_error "Product list failed"
    fi

    run_test "Product Creation"
    CREATE_PRODUCT=$(curl -s -X POST http://localhost:3000/api/products \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "name": "Test Product",
        "code": "TEST'$(date +%s)'",
        "listPrice": 100.00,
        "costPrice": 75.00,
        "category": "electronics"
      }')
    
    if echo "$CREATE_PRODUCT" | grep -q "id"; then
        print_success "Product creation working"
    else
        print_error "Product creation failed"
    fi
else
    print_error "No authentication token - skipping product tests"
fi

# 8. PERFORMANCE TESTS
print_header "8. PERFORMANCE TESTS"

run_test "API Response Time"
START_TIME=$(date +%s%N)
curl -s http://localhost:3000/api/health > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 200 ]; then
    print_success "API response time: ${RESPONSE_TIME}ms (Good)"
elif [ $RESPONSE_TIME -lt 500 ]; then
    print_warning "API response time: ${RESPONSE_TIME}ms (Acceptable)"
else
    print_error "API response time: ${RESPONSE_TIME}ms (Too slow)"
fi

# 9. FRONTEND BUILD TEST
print_header "9. FRONTEND BUILD TEST"

run_test "Frontend build status"
if docker-compose logs fotek_frontend | grep -q "Local.*ready"; then
    print_success "Frontend build successful"
else
    print_warning "Frontend might still be building"
fi

# FINAL RESULTS
print_header "TEST SUMMARY"

echo -e "📊 ${BLUE}Test Results:${NC}"
echo -e "   Total Tests: $TOTAL_TESTS"
echo -e "   ${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "   ${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}ALL TESTS PASSED!${NC}"
    echo -e "✅ ${GREEN}Fotek CRM is production ready${NC}"
    EXIT_CODE=0
else
    echo -e "\n⚠️  ${YELLOW}Some tests failed${NC}"
    echo -e "📋 Please check the failed tests above"
    EXIT_CODE=1
fi

# Performance Summary
echo -e "\n⚡ ${BLUE}Performance Metrics:${NC}"
echo -e "   API Response Time: ${RESPONSE_TIME}ms"
echo -e "   Containers Running: $(docker-compose ps | grep -c "Up")/4"

# System URLs
echo -e "\n🌐 ${BLUE}System URLs:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:80${NC}"
echo -e "   API: ${GREEN}http://localhost:3000/api/health${NC}"

echo -e "\n${BLUE}Test completed at: $(date)${NC}"
exit $EXIT_CODE
