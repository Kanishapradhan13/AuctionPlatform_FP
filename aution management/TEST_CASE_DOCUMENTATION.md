# Test Case Documentation
## Auction Management Service


---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Testing Strategy](#testing-strategy)
3. [Test Coverage Report](#test-coverage-report)
4. [Unit Tests](#unit-tests)
5. [Integration Tests](#integration-tests)
6. [Test-Driven Development Approach](#test-driven-development-approach)
7. [How to Run Tests](#how-to-run-tests)
8. [Continuous Testing](#continuous-testing)

---

## Executive Summary

This document provides comprehensive documentation for all test cases implemented in the Auction Management Service. The service has achieved **78.38% code coverage** with **81 test cases** covering critical business logic, validation rules, and API endpoints.

### Test Statistics
- **Total Test Suites:** 4
- **Total Tests:** 81 (100% passing)
- **Statement Coverage:** 78.38%
- **Branch Coverage:** 80.57%
- **Function Coverage:** 89.65%
- **Line Coverage:** 80.23%
- **Target Coverage:** 60%  **EXCEEDED**

### Test Types Implemented
1.  **Unit Tests** - Testing individual functions and modules in isolation
2.  **Integration Tests** - Testing API endpoints and their interactions
3.  **Structural Testing** - Testing code paths, branches, and edge cases
4.  **Code Coverage Analysis** - Measuring test effectiveness

---

## Testing Strategy

### 1. Unit Testing Approach
Unit tests focus on testing individual components in isolation:
- **Validators**: Testing business rules and input validation
- **Models**: Testing database operations with mocked Supabase client
- **Pure Functions**: Testing utility functions like room code generation

### 2. Integration Testing Approach
Integration tests validate the entire request-response cycle:
- API endpoint testing using Supertest
- Request validation and error handling
- Authentication and authorization flows
- Business logic execution through controllers

### 3. Test-Driven Development (TDD)
While the tests were written after initial implementation, they follow TDD principles:
- **Red-Green-Refactor cycle** can be used for future features
- Tests define expected behavior before implementation
- Comprehensive test coverage ensures refactoring safety

---

## Test Coverage Report

### Coverage by Module

| Module | Statements | Branch | Functions | Lines | Focus Areas |
|--------|-----------|---------|-----------|-------|-------------|
| **controllers/auctionController.js** | 76.57% | 83.33% | 100% | 76.57% | Business logic, error handling |
| **models/auctionModel.js** | 80% | 68.96% | 90% | 93.33% | Database operations |
| **models/itemModel.js** | 100% | 100% | 100% | 100% |  Full coverage |
| **routes/auctionRoutes.js** | 100% | 100% | 100% | 100% |  Full coverage |
| **utils/validators.js** | 100% | 100% | 100% | 100% |  Full coverage |
| **utils/supabase.js** | 75% | 75% | 100% | 75% | Configuration |
| **middlewares/auth.js** | 4.76% | 0% | 0% | 4.76% |  Low coverage (external service dependency) |

### Areas of High Coverage (100%)
1. **Validators Module** - All validation rules tested
2. **Item Model** - Complete CRUD operation coverage
3. **Auction Routes** - All endpoint definitions covered

### Areas for Improvement
1. **Auth Middleware** (4.76%) - Requires integration with User Service for full testing
2. **Error Handlers** (76.57%) - Some error paths in controllers need additional tests

---

## Unit Tests

### Test Suite 1: Validator Tests (`tests/unit/validators.test.js`)

#### 1.1 Auction Validation Tests (17 test cases)

| Test Case ID | Test Name | Type | Purpose | Expected Result |
|--------------|-----------|------|---------|-----------------|
| VAL-001 | Valid auction data | Positive | Verify valid data passes | No errors |
| VAL-002 | Missing title | Negative | Validate title requirement | Error: "Title must be at least 5 characters" |
| VAL-003 | Short title (<5 chars) | Boundary | Test minimum title length | Error: "Title must be at least 5 characters" |
| VAL-004 | Missing description | Negative | Validate description requirement | Error: "Description must be at least 20 characters" |
| VAL-005 | Short description (<20 chars) | Boundary | Test minimum description length | Error: "Description must be at least 20 characters" |
| VAL-006 | Missing start_time | Negative | Validate start_time requirement | Error: "Start time is required" |
| VAL-007 | Missing end_time | Negative | Validate end_time requirement | Error: "End time is required" |
| VAL-008 | End before start | Logic | Validate time sequence | Error: "End time must be after start time" |
| VAL-009 | Duration < 1 hour | Boundary | Test minimum duration | Error: "Auction must be at least 1 hour long" |
| VAL-010 | Duration > 30 days | Boundary | Test maximum duration | Error: "Auction cannot be longer than 30 days" |
| VAL-011 | Duration = 1 hour | Boundary | Test minimum valid duration | Pass |
| VAL-012 | Duration = 30 days | Boundary | Test maximum valid duration | Pass |
| VAL-013 | Missing reserve_price | Negative | Validate price requirement | Error: "Reserve price must be greater than 0" |
| VAL-014 | Zero reserve_price | Boundary | Test minimum price | Error: "Reserve price must be greater than 0" |
| VAL-015 | Negative reserve_price | Negative | Test invalid price | Error: "Reserve price must be greater than 0" |
| VAL-016 | Multiple invalid fields | Combined | Test multiple errors | Multiple error messages |

**Code Example:**
```javascript
test('should fail if auction duration is less than 1 hour', () => {
  const auction = {
    ...validAuction,
    start_time: new Date('2025-01-01T10:00:00Z'),
    end_time: new Date('2025-01-01T10:30:00Z')
  };
  const errors = validateAuction(auction);
  expect(errors).toContain('Auction must be at least 1 hour long');
});
```

#### 1.2 Land Item Validation Tests (4 test cases)

| Test Case ID | Test Name | Type | Purpose | Expected Result |
|--------------|-----------|------|---------|-----------------|
| LAND-001 | Valid land item | Positive | Verify valid land data | No errors |
| LAND-002 | Missing land_size | Negative | Validate size requirement | Error: "Land size is required" |
| LAND-003 | Missing land_type | Negative | Validate type requirement | Error: "Land type is required" |
| LAND-004 | Optional fields missing | Positive | Verify optional fields | Pass |

#### 1.3 Vehicle Item Validation Tests (7 test cases)

| Test Case ID | Test Name | Type | Purpose | Expected Result |
|--------------|-----------|------|---------|-----------------|
| VEH-001 | Valid vehicle item | Positive | Verify valid vehicle data | No errors |
| VEH-002 | Missing make | Negative | Validate make requirement | Error: "Vehicle make is required" |
| VEH-003 | Missing model | Negative | Validate model requirement | Error: "Vehicle model is required" |
| VEH-004 | Missing year | Negative | Validate year requirement | Error: "Valid year is required (1990 or later)" |
| VEH-005 | Year before 1990 | Boundary | Test minimum year | Error: "Valid year is required (1990 or later)" |
| VEH-006 | Year = 1990 | Boundary | Test boundary year | Pass |

#### 1.4 Item Type Validation Tests (2 test cases)

| Test Case ID | Test Name | Type | Purpose | Expected Result |
|--------------|-----------|------|---------|-----------------|
| ITEM-001 | Missing item_type | Negative | Validate type requirement | Error: "Item type must be LAND or VEHICLE" |
| ITEM-002 | Invalid item_type | Negative | Test type restriction | Error: "Item type must be LAND or VEHICLE" |

#### 1.5 Room Code Generation Tests (4 test cases)

| Test Case ID | Test Name | Type | Purpose | Expected Result |
|--------------|-----------|------|---------|-----------------|
| ROOM-001 | Code length | Structural | Verify code format | 8 characters |
| ROOM-002 | Alphanumeric only | Structural | Verify character set | Only A-Z, 0-9 |
| ROOM-003 | Uniqueness (3 codes) | Logic | Test randomness | All unique |
| ROOM-004 | Uniqueness (100 codes) | Stress | Test collision rate | All unique |

**Total Validator Tests: 34 test cases**

---

### Test Suite 2: Auction Model Tests (`tests/unit/auctionModel.test.js`)

#### 2.1 Create Operations (2 test cases)

| Test Case ID | Test Name | Type | Purpose | Expected Result |
|--------------|-----------|------|---------|-----------------|
| MODEL-001 | Create auction with room | Positive | Test auction creation | Returns auction with room_code |
| MODEL-002 | Create fails | Negative | Test error handling | Throws database error |

#### 2.2 Read Operations (9 test cases)

| Test Case ID | Test Name | Type | Purpose | Expected Result |
|--------------|-----------|------|---------|-----------------|
| MODEL-003 | Get all with default pagination | Positive | Test listing | Returns auctions, page 1, limit 20 |
| MODEL-004 | Filter by status | Filter | Test status filtering | Returns filtered results |
| MODEL-005 | Filter by seller_id | Filter | Test seller filtering | Returns seller's auctions |
| MODEL-006 | Custom pagination | Boundary | Test pagination | Returns correct page/limit |
| MODEL-007 | Get by ID | Positive | Test single retrieval | Returns specific auction |
| MODEL-008 | Get by ID not found | Negative | Test not found case | Throws error |
| MODEL-009 | Get by room code | Positive | Test room code lookup | Returns auction |
| MODEL-010 | Search by term | Search | Test search functionality | Returns matching results |
| MODEL-011 | Get active rooms | Filter | Test active rooms | Returns only active |

#### 2.3 Update Operations (3 test cases)

| Test Case ID | Test Name | Type | Purpose | Expected Result |
|--------------|-----------|------|---------|-----------------|
| MODEL-012 | Update auction | Positive | Test update | Returns updated data |
| MODEL-013 | Update includes timestamp | Structural | Verify timestamp | Has updated_at field |
| MODEL-014 | Update room participants | Positive | Test participant count | Returns updated count |

#### 2.4 Delete Operations (1 test case)

| Test Case ID | Test Name | Type | Purpose | Expected Result |
|--------------|-----------|------|---------|-----------------|
| MODEL-015 | Soft delete | Positive | Test cancellation | Status = CANCELLED |

**Total Auction Model Tests: 15 test cases**

---

### Test Suite 3: Item Model Tests (`tests/unit/itemModel.test.js`)

| Test Case ID | Test Name | Type | Purpose | Expected Result |
|--------------|-----------|------|---------|-----------------|
| ITEM-MODEL-001 | Create item | Positive | Test item creation | Returns created item |
| ITEM-MODEL-002 | Create fails | Negative | Test error handling | Throws error |
| ITEM-MODEL-003 | Get by auction ID | Positive | Test retrieval | Returns item |
| ITEM-MODEL-004 | Get not found | Negative | Test not found | Throws error |
| ITEM-MODEL-005 | Update item | Positive | Test update | Returns updated item |
| ITEM-MODEL-006 | Update fails | Negative | Test error handling | Throws error |
| ITEM-MODEL-007 | Delete item | Positive | Test deletion | Returns deleted item |
| ITEM-MODEL-008 | Delete fails | Negative | Test error handling | Throws error |

**Total Item Model Tests: 8 test cases**

---

## Integration Tests

### Test Suite 4: Auction API Tests (`tests/integration/auction.test.js`)

#### 4.1 POST /api/auctions - Create Auction (8 test cases)

| Test Case ID | HTTP Method | Endpoint | Test Scenario | Expected Status | Expected Response |
|--------------|------------|----------|---------------|-----------------|-------------------|
| API-001 | POST | /api/auctions | Create with valid data | 201 | Auction object with ID |
| API-002 | POST | /api/auctions | Create with item | 201 | Auction with auction_items |
| API-003 | POST | /api/auctions | Invalid title | 400 | Error: title validation |
| API-004 | POST | /api/auctions | Invalid description | 400 | Error: description validation |
| API-005 | POST | /api/auctions | Invalid price | 400 | Error: price validation |
| API-006 | POST | /api/auctions | Invalid duration | 400 | Error: duration validation |
| API-007 | POST | /api/auctions | Invalid item type | 400 | Error + rollback |
| API-008 | POST | /api/auctions | Item validation fails | 400 | Auction deleted (rollback) |

**Test Example:**
```javascript
test('should create auction successfully with valid data', async () => {
  const response = await request(app)
    .post('/api/auctions')
    .set('x-user-id', 'user-1')
    .send({
      title: 'Test Auction',
      description: 'This is a test auction with valid description',
      start_time: '2025-01-01T10:00:00Z',
      end_time: '2025-01-02T10:00:00Z',
      reserve_price: 1000
    });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
});
```

#### 4.2 GET /api/auctions - List Auctions (3 test cases)

| Test Case ID | HTTP Method | Endpoint | Test Scenario | Expected Status | Expected Response |
|--------------|------------|----------|---------------|-----------------|-------------------|
| API-009 | GET | /api/auctions | Get all | 200 | Array of auctions |
| API-010 | GET | /api/auctions?status=ACTIVE | Filter by status | 200 | Filtered results |
| API-011 | GET | /api/auctions?page=2&limit=10 | Pagination | 200 | Page 2 results |

#### 4.3 GET /api/auctions/:id - Get Single Auction (2 test cases)

| Test Case ID | HTTP Method | Endpoint | Test Scenario | Expected Status | Expected Response |
|--------------|------------|----------|---------------|-----------------|-------------------|
| API-012 | GET | /api/auctions/:id | Get existing | 200 | Auction object |
| API-013 | GET | /api/auctions/:id | Not found | 404 | Error: not found |

#### 4.4 GET /api/auctions/room/:roomCode - Get by Room (2 test cases)

| Test Case ID | HTTP Method | Endpoint | Test Scenario | Expected Status | Expected Response |
|--------------|------------|----------|---------------|-----------------|-------------------|
| API-014 | GET | /api/auctions/room/:code | Valid room code | 200 | Auction with room |
| API-015 | GET | /api/auctions/room/:code | Invalid code | 404 | Error: not found |

#### 4.5 PUT /api/auctions/:id - Update Auction (3 test cases)

| Test Case ID | HTTP Method | Endpoint | Test Scenario | Expected Status | Expected Response |
|--------------|------------|----------|---------------|-----------------|-------------------|
| API-016 | PUT | /api/auctions/:id | Update by owner | 200 | Updated auction |
| API-017 | PUT | /api/auctions/:id | Update by non-owner | 403 | Error: not authorized |
| API-018 | PUT | /api/auctions/:id | Update non-DRAFT | 400 | Error: only draft editable |

#### 4.6 DELETE /api/auctions/:id - Cancel Auction (2 test cases)

| Test Case ID | HTTP Method | Endpoint | Test Scenario | Expected Status | Expected Response |
|--------------|------------|----------|---------------|-----------------|-------------------|
| API-019 | DELETE | /api/auctions/:id | Cancel by owner | 200 | Success message |
| API-020 | DELETE | /api/auctions/:id | Cancel by non-owner | 403 | Error: not authorized |

#### 4.7 PUT /api/auctions/:id/status - Update Status (2 test cases)

| Test Case ID | HTTP Method | Endpoint | Test Scenario | Expected Status | Expected Response |
|--------------|------------|----------|---------------|-----------------|-------------------|
| API-021 | PUT | /api/auctions/:id/status | Valid transition | 200 | Updated status |
| API-022 | PUT | /api/auctions/:id/status | Invalid transition | 400 | Error: invalid transition |

#### 4.8 GET /api/auctions/search - Search (2 test cases)

| Test Case ID | HTTP Method | Endpoint | Test Scenario | Expected Status | Expected Response |
|--------------|------------|----------|---------------|-----------------|-------------------|
| API-023 | GET | /api/auctions/search?q=land | Valid search | 200 | Search results |
| API-024 | GET | /api/auctions/search?q=ab | Short term | 400 | Error: min 3 chars |

#### 4.9 Room Operations (3 test cases)

| Test Case ID | HTTP Method | Endpoint | Test Scenario | Expected Status | Expected Response |
|--------------|------------|----------|---------------|-----------------|-------------------|
| API-025 | GET | /api/auctions/rooms/active | Get active rooms | 200 | Array of rooms |
| API-026 | POST | /api/auctions/room/:code/join | Join active room | 200 | Success + count increment |
| API-027 | POST | /api/auctions/room/:code/join | Join inactive room | 400 | Error: not active |

**Total Integration Tests: 27 test cases**

---

## Test-Driven Development Approach

### TDD Principles Applied

1. **Red-Green-Refactor Cycle**
   -  **Red**: Write failing test first
   -  **Green**: Write minimal code to pass
   -  **Refactor**: Improve code while tests pass

2. **Test First Mindset**
   - Tests define specifications
   - Tests serve as documentation
   - Tests enable safe refactoring

3. **Benefits Achieved**
   - **Confidence**: 78% coverage ensures safety
   - **Documentation**: Tests show usage examples
   - **Design**: Tests encourage modular code
   - **Regression Prevention**: Changes are validated

### Future TDD Workflow

For new features, follow this pattern:

```javascript
// 1. RED: Write failing test
describe('New Feature', () => {
  test('should do something new', () => {
    const result = newFeature(input);
    expect(result).toBe(expected);
  });
});

// 2. GREEN: Implement feature
function newFeature(input) {
  return expected;
}

// 3. REFACTOR: Improve implementation
function newFeature(input) {
  // Optimized, cleaner implementation
  return expected;
}
```

---

## How to Run Tests

### Prerequisites
```bash
cd auction-service-backend
npm install
```

### Running All Tests
```bash
npm test
```

### Running Tests in Watch Mode
```bash
npm run test:watch
```

### Running Specific Test Suites
```bash
# Unit tests only
npm test tests/unit/

# Integration tests only
npm test tests/integration/

# Specific test file
npm test tests/unit/validators.test.js
```

### Viewing Coverage Report
```bash
# Generate coverage report
npm test -- --coverage

# View HTML coverage report
# Open: coverage/lcov-report/index.html
```

### Test Output Format
```
PASS tests/unit/validators.test.js
PASS tests/unit/auctionModel.test.js
PASS tests/unit/itemModel.test.js
PASS tests/integration/auction.test.js

Test Suites: 4 passed, 4 total
Tests:       81 passed, 81 total
Snapshots:   0 total
Time:        1.131 s

Coverage:
  Statements   : 78.38%
  Branches     : 80.57%
  Functions    : 89.65%
  Lines        : 80.23%
```

---

## Continuous Testing

### Best Practices

1. **Run Tests Before Commits**
   ```bash
   npm test
   git add .
   git commit -m "feat: add new feature"
   ```

2. **Run Tests in CI/CD Pipeline**
   - Automate test execution on push
   - Block merges if tests fail
   - Generate coverage reports

3. **Watch Mode During Development**
   ```bash
   npm run test:watch
   ```

4. **Coverage Thresholds**
   - Maintain minimum 60% coverage
   - Aim for 80%+ on critical paths
   - 100% on validators and models

### Testing Checklist

Before deploying:
- [ ] All tests pass
- [ ] Coverage > 60%
- [ ] No console errors
- [ ] Integration tests pass
- [ ] Edge cases covered
- [ ] Error handling tested

---

## Appendix

### Test Environment Configuration

**File:** `tests/setup.js`
```javascript
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-key';
```

### Mock Configuration

**File:** `src/utils/__mocks__/supabase.js`
```javascript
const supabase = {
  from: jest.fn()
};
module.exports = supabase;
```

### Test Dependencies
- **jest**: Testing framework
- **supertest**: HTTP assertions
- **@supabase/supabase-js**: Database client (mocked)

---

## Conclusion

The Auction Management Service has achieved comprehensive test coverage with:

-  **81 passing tests** across 4 test suites
-  **78.38% code coverage** (exceeds 60% target)
-  **Unit tests** for validators and models
-  **Integration tests** for all API endpoints
-  **Structural testing** with branch coverage
-  **TDD-ready** workflow for future development

![alt text](<Screenshot from 2025-11-23 22-46-37.png>)

![alt text](<Screenshot from 2025-11-24 17-21-36.png>)

---


